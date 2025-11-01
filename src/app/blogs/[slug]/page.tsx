"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { FaTwitter, FaLinkedin, FaLink } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface BlogPost {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  createdAt?: string;
  coverUrl?: string;
  categories?: string[];
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Invalid slug");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
        const res = await fetch(`${base}/api/blogs?populate=*`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const json = await res.json();

        let raw: any | null = null;

        if (Array.isArray(json?.data)) {
          const found = json.data.find((item: any) => {
            const attrs = item?.attributes ?? item;
            return attrs?.slug === slug;
          });
          if (found) raw = found.attributes ?? found;
        }

        if (!raw) {
          setError("Post not found");
          setPost(null);
          return;
        }

        const coverUrlRaw = raw.cover?.data?.attributes?.url ?? raw.cover?.url ?? raw.coverUrl;
        const coverUrl =
          coverUrlRaw && typeof coverUrlRaw === "string"
            ? coverUrlRaw.startsWith("http")
              ? coverUrlRaw
              : `${base}${coverUrlRaw}`
            : undefined;

        let categories: string[] | undefined;
        if (Array.isArray(raw.categories?.data)) {
          categories = raw.categories.data.map((c: any) => c.attributes?.name ?? c.name);
        }

        const normalized: BlogPost = {
          title: raw.title ?? "",
          slug: raw.slug ?? "",
          description: raw.description ?? "",
          content: raw.content ?? "",
          createdAt: raw.createdAt,
          coverUrl,
          categories,
        };

        setPost(normalized);
      } catch (err: any) {
        console.error("Error fetching post:", err);
        setError(err?.message ?? "Error fetching post");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = (platform: "twitter" | "linkedin" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (platform === "twitter") {
        const text = encodeURIComponent(post?.title ?? "");
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`);
      } else if (platform === "linkedin") {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
      } else {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to share!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-20">
        <p>{error}</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Go Back
        </button>
      </div>
    );

  if (!post) return <div className="text-center mt-20 text-gray-500">Post not found 😕</div>;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="mt-12 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900">{post.title}</h1>
        <div className="text-sm text-gray-500 flex justify-center gap-4">
          {post.createdAt && <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>}
          <span>⏱️ {Math.ceil((post.content?.split(" ").length || 0) / 200)} min read</span>
        </div>
      </div>

      {/* Hero Image */}
      {post.coverUrl && (
        <div
          className="relative mt-8 w-full h-[420px] rounded-2xl shadow-lg overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${post.coverUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
        </div>
      )}

      {/* Share Buttons */}
      <div className="flex justify-center gap-4 mt-8 px-4">
        <button
          onClick={() => handleShare("twitter")}
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition"
        >
          <FaTwitter /> Twitter
        </button>
        <button
          onClick={() => handleShare("linkedin")}
          className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:opacity-90 transition"
        >
          <FaLinkedin /> LinkedIn
        </button>
        <button
          onClick={() => handleShare("copy")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:opacity-90 transition"
        >
          <FaLink /> Copy Link
        </button>
      </div>

      {/* Description */}
      {post.description && (
        <p className="text-gray-600 italic text-center mt-6 mb-10 px-4">{post.description}</p>
      )}

      {/* Blog Content */}
      <div className="prose prose-lg max-w-none px-4 md:px-0">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content ?? ""}
        </Markdown>
      </div>

      {/* Back Button */}
      <div className="mt-10 text-center">
        <button onClick={() => router.push("/")} className="text-purple-600 hover:underline text-lg">
          ← Back to Blogs
        </button>
      </div>
    </div>
  );
}
