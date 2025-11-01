/**
 * Utility function to get the base URL for the current environment.
 * 
 * This function prevents DEPLOYMENT_DELETED errors by automatically detecting
 * the correct URL instead of relying on hardcoded deployment URLs.
 * 
 * Priority order:
 * 1. VERCEL_URL (automatically provided by Vercel - always current)
 * 2. NEXT_PUBLIC_BASE_URL (production domain if configured)
 * 3. localhost (development fallback)
 * 
 * @returns The base URL for the current environment
 */
export function getBaseUrl(): string {
  // Vercel automatically provides VERCEL_URL with the current deployment URL
  // This is always up-to-date and won't reference deleted deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // If you have a custom production domain configured, use it
  // Make sure this is set to your production domain, NOT a deployment-specific URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

