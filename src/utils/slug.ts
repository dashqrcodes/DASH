/**
 * Generate URL-friendly slug from name
 * Example: "Kobe Bryant" -> "kobe-bryant"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 50); // Max length
}

/**
 * Get memorial URL from slug
 */
export function getMemorialUrl(slug: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://dashmemories.com';
  return `${baseUrl}/memorial/${slug}`;
}

