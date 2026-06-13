/**
 * Input sanitization utilities
 * Strips dangerous content from user inputs
 */

/**
 * Strip HTML tags and script content from a string
 */
export function stripHtml(input: string): string {
  if (!input) return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Sanitize a general text input (name, etc)
 * Removes HTML, trims, limits length
 */
export function sanitizeText(input: string, maxLength = 200): string {
  if (!input) return "";
  let clean = stripHtml(input);
  // Remove null bytes
  clean = clean.replace(/\0/g, "");
  // Limit length
  if (clean.length > maxLength) clean = clean.slice(0, maxLength);
  return clean.trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string): string {
  if (!input) return "";
  // Lowercase, trim, remove spaces
  let clean = input.toLowerCase().trim().replace(/\s/g, "");
  // Remove any HTML
  clean = stripHtml(clean);
  // Basic email format check (more strict validation done by zod)
  if (clean.length > 254) clean = clean.slice(0, 254);
  return clean;
}

/**
 * Sanitize phone number - only allow digits
 */
export function sanitizePhone(input: string): string {
  if (!input) return "";
  // Only keep digits, +, and spaces (for formatting)
  let clean = input.replace(/[^0-9+\s\-]/g, "");
  // Remove HTML just in case
  clean = stripHtml(clean);
  if (clean.length > 20) clean = clean.slice(0, 20);
  return clean.trim();
}

/**
 * Normalize WhatsApp group invite link
 */
export function cleanGroupLink(input: string): string {
  if (!input) return "";
  let clean = input.trim();
  clean = stripHtml(clean);
  clean = clean.replace(/[\x00-\x1f\x7f]/g, "");
  clean = clean.split("?")[0].trim().replace(/\/+$/u, "");
  if (!clean.startsWith("https://") && !clean.startsWith("http://")) {
    clean = "https://" + clean;
  }
  return clean;
}

export function getGroupInviteCode(link: string): string {
  const clean = cleanGroupLink(link);
  if (!clean.startsWith("https://chat.whatsapp.com/")) return "";
  return clean.replace(/^https?:\/\/chat\.whatsapp\.com\//i, "").trim();
}

/**
 * Sanitize URL input (group link)
 */
export function sanitizeUrl(input: string): string {
  if (!input) return "";
  const clean = cleanGroupLink(input);
  if (!clean.startsWith("https://") && !clean.startsWith("http://")) {
    return "";
  }
  // Block javascript: protocol
  if (clean.toLowerCase().includes("javascript:")) return "";
  if (clean.toLowerCase().includes("data:")) return "";
  return clean.length > 500 ? clean.slice(0, 500) : clean;
}

/**
 * Validate WhatsApp group link format
 */
export function isValidGroupLink(url: string): boolean {
  if (!url) return false;
  const pattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,}$/;
  return pattern.test(cleanGroupLink(url));
}
