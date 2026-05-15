/** @type {import('next').NextConfig} */

// STATIC EXPORT config for WHM/cPanel deployment (no Node.js needed)
// Copy this as next.config.mjs before running: npm run build

const nextConfig = {
  // Static HTML export — generates /out folder with all HTML/CSS/JS
  output: "export",

  // Subfolder: https://obesityworldconference.com/mechanical
  basePath: "/mechanical",
  assetPrefix: "/mechanical/",

  // Trailing slashes for clean Apache URLs
  trailingSlash: true,

  images: {
    // Static export can't use Next.js image optimization
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "obesityworldconference.com",
        pathname: "/mechanical/**",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
    ],
  },

  // Environment variables baked into the static build
  env: {
    NEXT_PUBLIC_API_URL: "https://obesityworldconference.com/mechanical/api/api",
    NEXT_PUBLIC_SITE_URL: "https://obesityworldconference.com",
    NEXT_PUBLIC_BASE_PATH: "/mechanical",
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
