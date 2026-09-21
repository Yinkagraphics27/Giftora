import { supabase } from "@/integrations/supabase/client";

interface InitOrderPaymentParams {
  orderId: string;
  email: string;
  amount: number; // In Naira
}

interface InitOrderPaymentResponse {
  access_code: string;
  reference: string;
  authorization_url: string;
}

export async function initOrderPayment({
  orderId,
  email,
  amount,
}: InitOrderPaymentParams): Promise<InitOrderPaymentResponse> {
  const { data, error } = await supabase.functions.invoke("paystack-order-init", {
    body: {
      order_id: orderId,
      email,
      amount,
      callback_url: `${window.location.origin}/order/${orderId}`,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to initialize payment");
  }

  if (!data?.access_code) {
    throw new Error("Payment initialization returned no access code");
  }

  return data;
}