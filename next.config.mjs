/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "honorable-breeze-55074c763a.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "honorable-breeze-55074c763a.media.strapiapp.com", // ✅ Added Strapi media domain
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
