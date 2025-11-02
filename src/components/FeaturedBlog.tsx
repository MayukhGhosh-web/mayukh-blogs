// FeaturedBlog.tsx
import Link from "next/link";
import { BlogPost } from "@/lib/types";

interface FeaturedBlogProps {
  post: BlogPost;
}

export default function FeaturedBlog({ post }: FeaturedBlogProps) {
  if (!post) return null;

  // If cover is a string, handle full URL or relative path
  const coverUrl =
    typeof post.cover === "string"
      ? post.cover.startsWith("http")
        ? post.cover
        : `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.cover}`
      : null;

  return (
    <Link href={`/blogs/${post.slug}`}>
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg cursor-pointer group">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={post.title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black/70 to-transparent p-6 md:p-10 text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{post.title}</h2>
          <p className="text-sm md:text-lg mb-4">{post.description}</p>
          <div>
            <span className="inline-block bg-white text-black px-5 py-2 rounded-full font-semibold text-sm md:text-base transition-all duration-300 group-hover:bg-black group-hover:text-white border border-white">
              Read More →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
