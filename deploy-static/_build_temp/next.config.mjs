/** @type {import('next').NextConfig} */

// LOCAL TESTING config for static export
// Tests at: http://localhost/Mechanical/deploy-static/out/

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
        pathname: "/Mechanical/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost/Mechanical/api/api",
    NEXT_PUBLIC_SITE_URL: "http://localhost",
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
