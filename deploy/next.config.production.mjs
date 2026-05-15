/** @type {import('next').NextConfig} */

// PRODUCTION config for WHM deployment
// Copy this to /home/USERNAME/servora-nextjs/next.config.mjs before building

const nextConfig = {
  // Subfolder deployment: /servora
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/servora",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "obesityworldconference.com",
        pathname: "/servora/**",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        // Proxy API calls through Next.js to PHP backend
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/servora/api/api"}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
