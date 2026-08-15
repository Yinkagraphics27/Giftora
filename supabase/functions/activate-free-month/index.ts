import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    // Check if already earned free month
    if (vendor.free_month_earned) {
      return new Response(
        JSON.stringify({ error: "Free month already claimed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count products
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendor.id);

    if ((productCount || 0) < 100) {
      return new Response(
        JSON.stringify({ 
          error: "Not eligible yet", 
          current_count: productCount,
          required: 100 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for admin operations
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Activate free month
    const { error: updateError } = await adminClient
      .from("vendor_profiles")
      .update({
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
        free_month_earned: true,
      })
      .eq("id", vendor.id);

    if (updateError) {
      throw updateError;
    }

    // Publish all draft products
    const { error: productsError } = await adminClient
      .from("products")
      .update({ status: "active" })
      .eq("vendor_id", vendor.id)
      .eq("status", "draft");

    if (productsError) {
      console.error("Error publishing drafts:", productsError);
    }

    // Record as free reward
    await adminClient.from("vendor_payments").insert({
      vendor_id: vendor.id,
      amount: 0,
      currency: "NGN",
      payment_type: "free_reward",
      description: "Free month reward for reaching 100 products",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Free month activated! All your products are now published.",
        expires_at: expiresAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error activating free month:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
