import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY", 
  "SUPABASE_SERVICE_ROLE_KEY"
];

const env = {} as Record<string, string>;
for (const key of requiredEnvVars) {
  const value = Deno.env.get(key);
  if (!value) {
    console.error(`❌ Missing required env var: ${key}`);
    Deno.exit(1);
  }
  env[key] = value;
}

const CONFIG = {
  REQUIRED_PRODUCTS: parseInt(Deno.env.get("REQUIRED_PRODUCTS") || "100"),
  FREE_MONTH_DAYS: parseInt(Deno.env.get("FREE_MONTH_DAYS") || "30"),
  CURRENCY: Deno.env.get("CURRENCY") || "NGN",
};

const validateRequest = (req: Request): { valid: boolean; error?: string } => {
  if (req.method !== "POST") {
    return { valid: false, error: "Method not allowed. Use POST." };
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }
  const contentType = req.headers.get("Content-Type");
  if (contentType && !contentType.includes("application/json")) {
    return { valid: false, error: "Content-Type must be application/json" };
  }
  return { valid: true };
};

const jsonResponse = (data: any, status: number = 200) => {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const validation = validateRequest(req);
    if (!validation.valid) {
      return jsonResponse({ error: validation.error }, 400);
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    if (token.length < 20) {
      return jsonResponse({ error: "Invalid token format" }, 401);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.warn(`🔐 Auth failed: ${claimsError?.message || "Invalid claims"}`);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return jsonResponse({ error: "Invalid user ID in token" }, 401);
    }

    console.log(`🔍 Looking for vendor with user_id: ${userId}`);

    // Use admin client to bypass RLS
    const adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: vendor, error: vendorError } = await adminClient
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", userId);

    console.log(`📊 Vendor query result:`, { vendor, vendorError });

    if (vendorError) {
      console.error(`❌ Vendor query error:`, vendorError);
      return jsonResponse({ 
        error: "Vendor profile not found", 
        details: vendorError.message,
        user_id: userId 
      }, 404);
    }

    if (!vendor || vendor.length === 0) {
      console.warn(`👤 No vendor found for user: ${userId}`);
      return jsonResponse({ 
        error: "Vendor profile not found",
        user_id: userId
      }, 404);
    }

    const vendorProfile = vendor[0];
    console.log(`✅ Vendor found: ${vendorProfile.id}`);

    if (vendorProfile.free_month_earned) {
      return jsonResponse({ 
        error: "Free month already claimed",
        code: "ALREADY_CLAIMED"
      }, 400);
    }

    const { count: productCount, error: countError } = await adminClient
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorProfile.id);

    if (countError) {
      console.error(`📊 Count error: ${countError.message}`);
      return jsonResponse({ error: "Failed to count products" }, 500);
    }

    const currentCount = productCount || 0;
    if (currentCount < CONFIG.REQUIRED_PRODUCTS) {
      return jsonResponse({
        error: "Not eligible yet",
        code: "NOT_ELIGIBLE",
        current_count: currentCount,
        required: CONFIG.REQUIRED_PRODUCTS,
        remaining: CONFIG.REQUIRED_PRODUCTS - currentCount,
      }, 400);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CONFIG.FREE_MONTH_DAYS);

    console.log(`🔄 Starting transaction for vendor: ${vendorProfile.id} (${vendorProfile.business_name})`);

    const operations = [];
    let transactionFailed = false;
    let errorDetails = null;

    const { error: updateError } = await adminClient
      .from("vendor_profiles")
      .update({
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
        free_month_earned: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendorProfile.id);

    if (updateError) {
      transactionFailed = true;
      errorDetails = { operation: "update_vendor", error: updateError };
      console.error(`❌ Transaction failed at vendor update: ${updateError.message}`);
    } else {
      operations.push("update_vendor");
    }

    if (!transactionFailed) {
      const { error: productsError } = await adminClient
        .from("products")
        .update({ 
          status: "active",
          published_at: new Date().toISOString(),
        })
        .eq("vendor_id", vendorProfile.id)
        .eq("status", "draft");

      if (productsError) {
        transactionFailed = true;
        errorDetails = { operation: "publish_products", error: productsError };
        console.error(`❌ Transaction failed at product publish: ${productsError.message}`);
      } else {
        operations.push("publish_products");
      }
    }

    if (!transactionFailed) {
      const { error: paymentError } = await adminClient
        .from("vendor_payments")
        .insert({
          vendor_id: vendorProfile.id,
          amount: 0,
          currency: CONFIG.CURRENCY,
          payment_type: "free_reward",
          description: `Free month reward for reaching ${CONFIG.REQUIRED_PRODUCTS} products`,
          status: "completed",
          metadata: {
            product_count: currentCount,
            triggered_at: new Date().toISOString(),
          }
        });

      if (paymentError) {
        transactionFailed = true;
        errorDetails = { operation: "create_payment", error: paymentError };
        console.error(`❌ Transaction failed at payment record: ${paymentError.message}`);
      } else {
        operations.push("create_payment");
      }
    }

    if (transactionFailed) {
      console.warn(`⚠️ Transaction rolled back. Reversing ${operations.length} operations...`);
      
      if (operations.includes("create_payment")) {
        await adminClient
          .from("vendor_payments")
          .delete()
          .eq("vendor_id", vendorProfile.id)
          .eq("payment_type", "free_reward")
          .eq("amount", 0);
        console.log(`↩️ Rolled back: payment record`);
      }

      if (operations.includes("publish_products")) {
        await adminClient
          .from("products")
          .update({ 
            status: "draft",
            published_at: null,
          })
          .eq("vendor_id", vendorProfile.id)
          .eq("status", "active")
          .not("published_at", "is", null);
        console.log(`↩️ Rolled back: product publications`);
      }

      if (operations.includes("update_vendor")) {
        await adminClient
          .from("vendor_profiles")
          .update({
            subscription_status: vendorProfile.subscription_status || "inactive",
            subscription_expires_at: vendorProfile.subscription_expires_at,
            free_month_earned: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vendorProfile.id);
        console.log(`↩️ Rolled back: vendor profile`);
      }

      try {
        await adminClient
          .from("audit_logs")
          .insert({
            vendor_id: vendorProfile.id,
            action: "free_month_activation_failed",
            status: "failed",
            error: errorDetails?.error?.message || "Unknown error",
            metadata: {
              operations_completed: operations,
              product_count: currentCount,
              timestamp: new Date().toISOString(),
            }
          });
      } catch (err) {
        console.error("Failed to log audit:", err);
      }

      return jsonResponse({
        error: "Transaction failed. All changes have been rolled back.",
        code: "TRANSACTION_FAILED",
        details: errorDetails?.error?.message,
      }, 500);
    }

    console.log(`✅ Transaction completed successfully for vendor: ${vendorProfile.id}`);
    
    try {
      await adminClient
        .from("audit_logs")
        .insert({
          vendor_id: vendorProfile.id,
          action: "free_month_activation",
          status: "success",
          metadata: {
            operations: operations,
            product_count: currentCount,
            expires_at: expiresAt.toISOString(),
          }
        });
    } catch (err) {
      console.error("Failed to log audit:", err);
    }

    return jsonResponse({
      success: true,
      message: `🎉 Free month activated! All ${currentCount} products are now published.`,
      data: {
        vendor_id: vendorProfile.id,
        business_name: vendorProfile.business_name,
        product_count: currentCount,
        expires_at: expiresAt.toISOString(),
        free_month_days: CONFIG.FREE_MONTH_DAYS,
        operations_completed: operations,
      }
    }, 200);

  } catch (error) {
    console.error("💥 Unhandled error:", error);
    return jsonResponse({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

console.log(`🚀 Server running on http://localhost:8000`);
console.log(`📋 Configuration:`);
console.log(`   - Required products: ${CONFIG.REQUIRED_PRODUCTS}`);
console.log(`   - Free month days: ${CONFIG.FREE_MONTH_DAYS}`);
console.log(`   - Currency: ${CONFIG.CURRENCY}`);