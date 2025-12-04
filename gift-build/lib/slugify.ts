// Slug Generator for TikTok Gift Product
// Isolated to /gift-build folder

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function generateUniqueSlug(base: string): string {
  const slug = slugify(base);
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}


