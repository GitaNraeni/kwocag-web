export function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "ORD";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
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
