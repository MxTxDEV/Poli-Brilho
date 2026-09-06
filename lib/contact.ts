export const WHATSAPP_NUMBER = "31997837742";
export const WHATSAPP_DISPLAY = "31 99783-7742";
export const INSTAGRAM_HANDLE = "@polibrilhoo_";
export const INSTAGRAM_URL = "https://instagram.com/polibrilhoo_";

export function whatsappLink(message: string): string {
  return `https://wa.me/55${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
