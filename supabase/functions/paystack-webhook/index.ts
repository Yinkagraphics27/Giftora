import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface PaystackEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization?: {
      authorization_code: string;
    };
    subscription_code?: string;
    metadata?: {
      vendor_id?: string;
      vendor_name?: string;
      type?: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify signature
    const hash = createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event: PaystackEvent = JSON.parse(body);
    console.log("Received Paystack event:", event.event);

    // Use service role client for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(supabase, event.data);
        break;

      case "subscription.create":
        await handleSubscriptionCreate(supabase, event.data);
        break;

      case "subscription.disable":
        await handleSubscriptionDisable(supabase, event.data);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(supabase, event.data);
        break;

      default:
        console.log("Unhandled event type:", event.event);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 500 });
  }
});

async function handleChargeSuccess(supabase: any, data: PaystackEvent["data"]) {
  const vendorId = data.metadata?.vendor_id;
  if (!vendorId) {
    console.error("No vendor_id in metadata");
    return;
  }

  console.log("Processing charge success for vendor:", vendorId);

  // Calculate expiry date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Update vendor subscription status
  const { error: updateError } = await supabase
    .from("vendor_profiles")
    .update({
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
      paystack_customer_code: data.customer.customer_code,
      paystack_authorization_code: data.authorization?.authorization_code || null,
      subscription_paused_at: null, // Clear any pause
    })
    .eq("id", vendorId);

  if (updateError) {
    console.error("Error updating vendor:", updateError);
    return;
  }

  // Auto-publish all draft products
  const { error: productsError } = await supabase
    .from("products")
    .update({ status: "active" })
    .eq("vendor_id", vendorId)
    .eq("status", "draft");

  if (productsError) {
    console.error("Error publishing products:", productsError);
  }

  // Record payment
  await supabase.from("vendor_payments").insert({
    vendor_id: vendorId,
    amount: data.amount,
    currency: data.currency.toUpperCase(),
    payment_type: "subscription",
    paystack_reference: data.reference,
    description: `Subscription payment - ${data.reference}`,
  });

  console.log("Subscription activated for vendor:", vendorId);
}

async function handleSubscriptionCreate(supabase: any, data: PaystackEvent["data"]) {
  const vendorId = data.metadata?.vendor_id;
  if (!vendorId) return;

  console.log("Storing subscription code for vendor:", vendorId);

  await supabase
    .from("vendor_profiles")
    .update({
      paystack_subscription_code: data.subscription_code,
    })
    .eq("id", vendorId);
}

async function handleSubscriptionDisable(supabase: any, data: PaystackEvent["data"]) {
  // Find vendor by subscription code
  const { data: vendor } = await supabase
    .from("vendor_profiles")
    .select("id")
    .eq("paystack_subscription_code", data.subscription_code)
    .single();

  if (!vendor) {
    console.error("Vendor not found for subscription:", data.subscription_code);
    return;
  }

  console.log("Subscription disabled for vendor:", vendor.id);

  // Mark subscription as expired - user will need to select 10 products
  await supabase
    .from("vendor_profiles")
    .update({
      subscription_status: "expired",
      paystack_subscription_code: null,
    })
    .eq("id", vendor.id);
}

async function handlePaymentFailed(supabase: any, data: PaystackEvent["data"]) {
  const vendorId = data.metadata?.vendor_id;
  if (!vendorId) return;

  console.log("Payment failed for vendor:", vendorId);

  // Record failed payment attempt
  await supabase.from("vendor_payments").insert({
    vendor_id: vendorId,
    amount: data.amount,
    currency: data.currency.toUpperCase(),
    payment_type: "failed_renewal",
    paystack_reference: data.reference,
    description: `Failed payment - ${data.reference}`,
  });
}
