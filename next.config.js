/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["./node_modules/pdfkit/**/*"],
    },
  },
};

module.exports = nextConfig;
