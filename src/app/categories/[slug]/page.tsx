"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/ui/ThemeContext"; // ✅ Import theme context

type RawBlog = any;

interface BlogPost {
  id?: number | string;
  attributes?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    cover?: {
      data?: {
        attributes?: {
          url?: string;
        };
      };
    };
  };
  title?: string;
  slug?: string;
  excerpt?: string;
  cover?: { url?: string };
}

const CategoryPage: React.FC = () => {
  const { slug } = useParams();
  const { theme } = useTheme(); // ✅ detect current theme
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ✅ Always use environment-based backend URL
  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "https://honorable-breeze-55074c763a.strapiapp.com";

  useEffect(() => {
    if (!slug) return;

    const fetchCategoryBlogs = async () => {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/categories?filters[slug][$eq]=${slug}&populate[blogs][populate]=cover`,
          { next: { revalidate: 60 } } // cache hint
        );

        const json = await res.json();
        const categoryData = json.data?.[0];

        if (categoryData) {
          const attrs = categoryData.attributes ?? categoryData;
          setCategoryName(attrs.name ?? "Untitled Category");

          const blogsData = attrs.blogs?.data ?? attrs.blogs ?? [];
          setBlogs(Array.isArray(blogsData) ? blogsData : []);
        } else {
          console.warn("No category found for slug:", slug);
          setCategoryName("Category not found");
          setBlogs([]);
        }
      } catch (error) {
        console.error("Error fetching category blogs:", error);
        setCategoryName("Error loading category");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryBlogs();
  }, [slug, STRAPI_URL]);

  if (loading) {
    return (
      <div className="text-center py-10 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
        Loading...
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-10 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
        No blogs found in this category.
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* --- Stylish Category Heading --- */}
        <h1
          className="text-5xl font-extrabold text-center mb-12 tracking-widest"
          style={{
            color: theme === "dark" ? "#FFD580" : "#B87333",
            textTransform: "uppercase",
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "0.15em",
          }}
        >
          {categoryName}
        </h1>

        {/* --- Blogs Grid --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: BlogPost | RawBlog) => {
            const attrs = (blog.attributes ?? blog) as any;
            const key = blog.id ?? attrs.slug ?? Math.random().toString(36).slice(2, 9);

            // ✅ Fixed image URL construction
            const coverPath =
              attrs?.cover?.data?.attributes?.url || attrs?.cover?.url || "";
            const coverUrl = coverPath
              ? `${STRAPI_URL}${coverPath}`
              : null;

            const title = attrs?.title ?? "Untitled Blog";
            const slugToUse = attrs?.slug ?? "";

            return (
              <Link
                key={key}
                href={`/blogs/${slugToUse}`}
                className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={title}
                    width={400}
                    height={250}
                    className="object-cover w-full h-48"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-sm">
                    No Image
                  </div>
                )}

                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-2 dark:text-gray-100 text-gray-900">
                    {title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {attrs?.excerpt ?? "Read more..."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
