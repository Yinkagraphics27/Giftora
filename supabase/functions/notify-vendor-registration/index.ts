import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VendorRegistrationPayload {
  vendorName: string;
  vendorEmail: string;
  vendorCountry: string;
  vendorCity: string;
  vendorId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: VendorRegistrationPayload = await req.json();
    const { vendorName, vendorEmail, vendorCountry, vendorCity, vendorId } = payload;

    // Get WhatsApp number from environment
    const adminWhatsApp = Deno.env.get("ADMIN_WHATSAPP_NUMBER");
    
    if (!adminWhatsApp) {
      console.log("ADMIN_WHATSAPP_NUMBER not configured, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No admin WhatsApp configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the app URL from environment or use default
    const appUrl = Deno.env.get("APP_URL") || "https://lpmsynryrvjsdysswhwk.lovable.app";
    
    // Create WhatsApp message with admin dashboard link
    const message = `🆕 New Vendor Registration!

📋 Business: ${vendorName}
📧 Email: ${vendorEmail}
📍 Location: ${vendorCity}, ${vendorCountry}

🔗 Review & Approve:
${appUrl}/admin

Vendor ID: ${vendorId}`;

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminWhatsApp.replace(/\D/g, "")}?text=${encodedMessage}`;

    console.log("WhatsApp notification prepared for:", vendorName);
    console.log("WhatsApp URL generated:", whatsappUrl);

    // Note: For automatic WhatsApp messages, you would need WhatsApp Business API
    // For now, we log the notification details
    // In a production environment, integrate with WhatsApp Business API or Twilio

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Vendor registration notification prepared",
        whatsappUrl 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-vendor-registration:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
