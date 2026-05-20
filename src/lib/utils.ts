export function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "ORD";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

/**
 * Normalize phone number ke format 628xxx
 * Support: 081xxx, 628xxx, +628xxx, 08xxx, 8xxx
 */
export function normalizePhone(phone: string): string {
  if (!phone) return phone;
  let cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  else if (cleaned.startsWith("8")) cleaned = "62" + cleaned;
  else if (cleaned.startsWith("+62")) cleaned = cleaned.slice(1);
  return cleaned;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getDurationLabel(duration: string, customDays?: number | null): string {
  switch (duration) {
    case "WEEKLY":
      return "1 Minggu";
    case "MONTHLY":
      return "1 Bulan";
    case "CUSTOM":
      return `${customDays || 0} Hari`;
    default:
      return duration;
  }
}

export function calculateExpiryDate(startDate: Date, duration: string, customDays?: number | null): Date {
  const expiry = new Date(startDate);
  switch (duration) {
    case "WEEKLY":
      expiry.setDate(expiry.getDate() + 7);
      break;
    case "MONTHLY":
      expiry.setMonth(expiry.getMonth() + 1);
      break;
    case "CUSTOM":
      expiry.setDate(expiry.getDate() + (customDays || 0));
      break;
  }
  return expiry;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
