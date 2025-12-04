/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolated TikTok Gift Funnel - separate deployment
  reactStrictMode: true,
  
  // Image domains
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.mux.com',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
    ],
  },
};

module.exports = nextConfig;


