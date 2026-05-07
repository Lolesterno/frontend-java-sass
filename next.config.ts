import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      }
    ]
  },
  allowedDevOrigins: ['lvh.me'],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.GATEWAY_URL}/api/v1/:path*`
      }
    ]
  }
};

export default nextConfig;
