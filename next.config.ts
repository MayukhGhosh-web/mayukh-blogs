import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"], // ✅ Allow images served from your Strapi backend
  },
};

export default nextConfig;
