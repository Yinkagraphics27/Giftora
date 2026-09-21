import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OrderInitRequest {
  order_id: string;
  email: string;
  amount: number;          // In Naira (will convert to kobo)
  callback_url?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: OrderInitRequest = await req.json();
    const { order_id, email, amount, callback_url } = body;

    // Validate input
    if (!order_id || !email || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing order_id, email, or amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client to verify order exists and get real total (never trust client amount)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id, total, payment_status, buyer_email")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "Order already paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use SERVER-SIDE total, not client-sent amount (prevents tampering)
    const serverAmount = Number(order.total);

    const reference = `giftora_order_${order_id.slice(0, 8)}_${Date.now()}`;

    // Initialize Paystack transaction
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || order.buyer_email,
          amount: Math.round(serverAmount * 100), // Naira → Kobo
          reference,
          callback_url: callback_url,
          metadata: {
            type: "order",           // ⬅️ KEY ROUTING FLAG
            order_id: order_id,
            source: "giftora_buyer_checkout",
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      return new Response(
        JSON.stringify({
          error: paystackData.message || "Failed to initialize payment",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the reference on the order (so we can match webhook later)
    await adminClient
      .from("orders")
      .update({ payment_ref: reference })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error initializing order payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});