"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/types";
import Loader from "@/components/Loader";
import FeaturedBlog from "@/components/FeaturedBlog";

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://honorable-breeze-55074c763a.strapiapp.com";

function HomePageContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [weeklyHot, setWeeklyHot] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(
          `${STRAPI_BASE_URL}/api/blogs?populate=cover&sort=createdAt:desc`
        );
        const json = await res.json();

        if (!json?.data) throw new Error("No blogs found");

        const fetchedPosts: BlogPost[] = json.data.map((item: any) => {
          const attrs = item.attributes || item;

          // ✅ Handle Strapi image formats from both local & cloud
          let imageUrl = "";
          const coverData = attrs.cover?.data?.attributes || attrs.cover?.data || attrs.cover;

          if (coverData?.url) {
            imageUrl = coverData.url.startsWith("http")
              ? coverData.url
              : `${STRAPI_BASE_URL}${coverData.url}`;
          } else if (typeof attrs.cover === "string") {
            imageUrl = attrs.cover.startsWith("http")
              ? attrs.cover
              : `${STRAPI_BASE_URL}${attrs.cover}`;
          }

          return {
            id: item.id,
            slug: attrs.slug,
            title: attrs.title,
            description: attrs.description,
            content: attrs.content || "",
            cover: imageUrl,
            categories: [],
            author: attrs.author || undefined,
            createdAt: attrs.createdAt || "",
          };
        });

        // Sort and highlight key blogs
        const sortedPosts = fetchedPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const featured = sortedPosts.find((p) =>
          p.title?.toLowerCase()?.includes("fifa wc 2026")
        );
        setFeaturedPost(featured || null);

        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const recentBlogs = sortedPosts.filter(
          (p) => now - new Date(p.createdAt).getTime() <= oneWeek
        );

        const weekly =
          recentBlogs.length > 0
            ? recentBlogs[Math.floor(Math.random() * recentBlogs.length)]
            : sortedPosts[0];

        setWeeklyHot(weekly);
        setPosts(sortedPosts);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const getCoverUrl = (cover: string | undefined) => {
    if (!cover) return "/default-thumbnail.jpg";
    return cover.startsWith("http") ? cover : `${STRAPI_BASE_URL}${cover}`;
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  const remainingPosts = posts.filter(
    (p) => p !== weeklyHot && p !== featuredPost
  );

  const latestBlogs = [...posts]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <main className="max-w-7xl mx-auto p-4">
      {featuredPost && <FeaturedBlog post={featuredPost} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* 🔥 Weekly Hot */}
        {weeklyHot && (
          <Link
            href={`/blogs/${weeklyHot.slug}`}
            className="relative block lg:col-span-2 rounded-lg overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {weeklyHot.cover && (
              <Image
                src={getCoverUrl(weeklyHot.cover as string)}
                alt={weeklyHot.title}
                width={700}
                height={400}
                unoptimized
                className="w-full h-[350px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                🔥 Trending This Week
              </span>
              <h3 className="font-extrabold text-2xl md:text-3xl mb-1 leading-tight">
                {weeklyHot.title}
              </h3>
              <p className="text-gray-200 line-clamp-8 mb-3 text-sm md:text-base">
                {weeklyHot.description}
              </p>
            </div>
          </Link>
        )}

        {/* 🧩 Compact Blogs */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          {remainingPosts.slice(0, 2).map((p) => (
            <Link
              key={p.slug}
              href={`/blogs/${p.slug}`}
              className="block border rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300"
            >
              {p.cover && (
                <Image
                  src={getCoverUrl(p.cover as string)}
                  alt={p.title}
                  width={400}
                  height={250}
                  unoptimized
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4 bg-white dark:bg-gray-900">
                <h3 className="text-gray-900 dark:text-gray-200 text-xl font-semibold">
                  {p.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm">
                  {p.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 🆕 Newly Added Blogs */}
        <aside className="bg-black text-white dark:bg-white dark:text-gray-900 rounded-lg shadow-md p-5 max-h-[650px] overflow-y-auto sticky top-0 lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4 text-center border-b border-gray-700 dark:border-gray-300 pb-2">
            Newly Added Blogs
          </h2>
          <div className="space-y-4">
            {latestBlogs.map((blog, index) => (
              <div key={blog.slug}>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="block hover:text-yellow-400 dark:hover:text-yellow-600 transition"
                >
                  <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
                  <p className="text-gray-400 dark:text-gray-600 text-sm line-clamp-2">
                    {blog.description || "Read more..."}
                  </p>
                </Link>
                {index < latestBlogs.length - 1 && (
                  <hr className="my-3 border-gray-700 dark:border-gray-300" />
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* 🧾 Remaining Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-10 mt-8 auto-rows-fr">
        {remainingPosts.slice(2).map((p) => (
          <Link
            key={p.slug}
            href={`/blogs/${p.slug}`}
            className="flex flex-col w-full gap-2 border rounded-lg shadow hover:shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
          >
            {p.cover && (
              <Image
                src={getCoverUrl(p.cover as string)}
                alt={p.title}
                width={500}
                height={300}
                unoptimized
                className="w-full h-56 object-cover"
              />
            )}
            <div className="p-4 bg-white dark:bg-gray-900 flex-1">
              <h3 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
                {p.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {p.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function HomePage() {
  return <HomePageContent />;
}
