/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add cache headers for static assets to improve performance
  // and handle chunk loading properly across deployments
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

