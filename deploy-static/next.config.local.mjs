/** @type {import('next').NextConfig} */

// LOCAL TESTING config for static export
// Tests at: http://localhost/Servora/deploy-static/out/

const nextConfig = {
  output: "export",
  basePath: "",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/Servora/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost/Servora/api/api",
    NEXT_PUBLIC_SITE_URL: "http://localhost",
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
