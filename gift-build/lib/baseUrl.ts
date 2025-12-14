export function getBaseUrl() {
  const envUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return envUrl ? envUrl.replace(/\/$/, '') : 'http://localhost:3000';
}

