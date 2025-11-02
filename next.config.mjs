/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "mayukh-blogs-backend.onrender.com",
      "honorable-breeze-55074c763a.strapiapp.com", // ✅ your Strapi Cloud domain
    ],
  },
};

export default nextConfig;
