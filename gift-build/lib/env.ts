const DEFAULT_LOCAL_URL = 'http://localhost:3000';

/**
 * Returns the best-known base URL for the application.
 * Falls back to localhost when explicit env vars are not present.
 */
export function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;

  const vercelUrl = process.env.VERCEL_URL;

  const raw =
    envUrl ||
    (vercelUrl ? (vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`) : undefined) ||
    DEFAULT_LOCAL_URL;

  return raw.replace(/\/$/, '');
}

export function getPreviewTtlHours(): number {
  const fallback = 72;
  const parsed = Number(process.env.PREVIEW_TTL_HOURS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}


