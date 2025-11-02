"use client";

import Link from "next/link";
import { BlogPost } from "@/lib/types";

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  if (!posts || posts.length === 0) return <p>No blogs found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {posts.map((post) => (
        <div key={post.id} className="border rounded p-4">
          <Link href={`/blogs/${post.slug}`}>
            {post.cover && (
   <img
    src={
      typeof post.cover === "string"
        ? post.cover
        : `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${
            post.cover.url ||
            post.cover.formats?.thumbnail?.url ||
            `/uploads/${post.cover.documentId}.jpeg`
          }`
    }
    alt={post.title}
    className="w-full h-40 object-cover mb-2 rounded"
  />
)}

            <h2 className="font-semibold text-lg">{post.title}</h2>
            <p className="text-gray-600">{post.description}</p>
          </Link>
        </div>
      ))}
    </div>
  );
}
