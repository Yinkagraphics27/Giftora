import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ManageRequest {
  action: "pause" | "resume" | "cancel";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Get vendor profile
    const { data: vendor, error: vendorError } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (vendorError || !vendor) {
      return new Response(
        JSON.stringify({ error: "Vendor profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ManageRequest = await req.json();
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (body.action) {
      case "pause": {
        // Check if already used 30 days of pause
        if (vendor.subscription_pause_days_used >= 30) {
          return new Response(
            JSON.stringify({ error: "Maximum pause limit reached (30 days)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (vendor.subscription_paused_at) {
          return new Response(
            JSON.stringify({ error: "Subscription is already paused" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Pause subscription
        await adminClient
          .from("vendor_profiles")
          .update({
            subscription_paused_at: new Date().toISOString(),
            subscription_status: "paused",
          })
          .eq("id", vendor.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Subscription paused. You can resume within 30 days.",
            pause_days_remaining: 30 - vendor.subscription_pause_days_used
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resume": {
        if (!vendor.subscription_paused_at) {
          return new Response(
            JSON.stringify({ error: "Subscription is not paused" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Calculate days paused
        const pausedAt = new Date(vendor.subscription_paused_at);
        const now = new Date();
        const daysPaused = Math.ceil((now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24));
        const totalPauseDays = vendor.subscription_pause_days_used + daysPaused;

        // Extend expiry by days paused
        let newExpiresAt = vendor.subscription_expires_at ? new Date(vendor.subscription_expires_at) : new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + daysPaused);

        await adminClient
          .from("vendor_profiles")
          .update({
            subscription_paused_at: null,
            subscription_status: "active",
            subscription_expires_at: newExpiresAt.toISOString(),
            subscription_pause_days_used: totalPauseDays,
          })
          .eq("id", vendor.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Subscription resumed!",
            new_expires_at: newExpiresAt.toISOString(),
            total_pause_days_used: totalPauseDays
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        // Cancel Paystack subscription if exists
        if (vendor.paystack_subscription_code) {
          try {
            await fetch("https://api.paystack.co/subscription/disable", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code: vendor.paystack_subscription_code,
                token: vendor.email, // Paystack uses email as token
              }),
            });
          } catch (error) {
            console.error("Error cancelling Paystack subscription:", error);
          }
        }

        // Update local status
        await adminClient
          .from("vendor_profiles")
          .update({
            subscription_status: "cancelled",
            paystack_subscription_code: null,
          })
          .eq("id", vendor.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Subscription cancelled. Your products will remain active until the end of the billing period."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error managing subscription:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
