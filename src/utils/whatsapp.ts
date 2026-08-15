/**
 * Generates a WhatsApp URL with a prefilled message
 * @param phoneNumber - WhatsApp phone number (without + sign)
 * @param message - The message to prefill
 * @returns The complete wa.me URL
 */
export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

/**
 * Generates a prefilled message for product inquiry
 * @param productName - Name of the product
 * @param category - Product category
 * @param vendorName - Name of the vendor
 * @returns Formatted inquiry message
 */
export const generateProductInquiryMessage = (
  productName: string,
  category: string,
  vendorName: string
): string => {
  return `Hi ${vendorName}! 👋

I'm interested in your product:
📦 *${productName}*
📁 Category: ${category}

I found it on Giftora and would like to know more about pricing and availability.

Thank you!`;
};

/**
 * Generates a prefilled message from inquiry form data
 * @param buyerName - Name of the buyer
 * @param message - Custom message from buyer
 * @param quantity - Quantity requested (optional)
 * @param productName - Name of the product
 * @param category - Product category
 * @param vendorName - Name of the vendor
 * @returns Formatted inquiry message with all form details
 */
export const generateFormInquiryMessage = (
  buyerName: string,
  message: string,
  quantity: number | undefined,
  productName: string,
  category: string,
  vendorName: string
): string => {
  let formattedMessage = `Hi ${vendorName}! 👋

I'm *${buyerName}* and I'm interested in your product:
📦 *${productName}*
📁 Category: ${category}`;

  if (quantity && quantity > 0) {
    formattedMessage += `\n📊 Quantity: ${quantity} units`;
  }

  formattedMessage += `

💬 *My Message:*
${message}

I found this on Giftora and look forward to hearing from you!`;

  return formattedMessage;
};

/**
 * Opens WhatsApp in a new tab with the prefilled message
 * @param phoneNumber - WhatsApp phone number
 * @param message - The message to prefill
 */
export const openWhatsAppChat = (phoneNumber: string, message: string): void => {
  const url = generateWhatsAppUrl(phoneNumber, message);
  window.open(url, "_blank", "noopener,noreferrer");
};
