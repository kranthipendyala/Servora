/** @type {import('next').NextConfig} */
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/Servora/api/index.php/api";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/Servora/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Sitemap: served directly by PHP API as XML (bypasses Cloudflare serverless blocks)
      {
        source: "/sitemap.xml",
        destination: `${apiUrl}/sitemap/xml?base=${encodeURIComponent(siteUrl)}`,
      },
      // General API proxy
      {
        source: "/proxy-api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
