"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  gql,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  useQuery,
} from "@apollo/client";

import { BlogPost } from "@/lib/types";
import Loader from "@/components/Loader";
import FeaturedBlog from "@/components/FeaturedBlog";

const GET_ALL_BLOGS_QUERY = gql`
  query GetAllBlogs {
    blogs {
      title
      description
      slug
      content
      createdAt
      cover {
        url
      }
    }
  }
`;

const mapStrapiGraphqlPost = (item: any): BlogPost => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  description: item.description,
  content: item.content || "",
  cover: item.cover?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${item.cover.url}`
    : undefined,
  categories: [],
  author: item.author || undefined,
  createdAt: item.createdAt || "",
});

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const GRAPHQL_URI = `${STRAPI_BASE_URL}/graphql`;

const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
  fetchOptions: { method: "POST" },
  headers: { "Content-Type": "application/json" },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: { query: { fetchPolicy: "no-cache" } },
});

function HomePageContent() {
  const { data, loading, error } = useQuery(GET_ALL_BLOGS_QUERY, {
    fetchPolicy: "no-cache",
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [weeklyHot, setWeeklyHot] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (data?.blogs) {
      const fetchedPosts: BlogPost[] = data.blogs.map((item: any) =>
        mapStrapiGraphqlPost(item)
      );

      // Sort newest first
      const sortedPosts = fetchedPosts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Fixed Featured Blog (e.g. FIFA 2026)
      const featured = sortedPosts.find((p) =>
        p.title.toLowerCase().includes("fifa wc 2026")
      );
      setFeaturedPost(featured || null);

      // Auto Weekly Hot: most engaging recent blog (7 days)
      const now = new Date().getTime();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      const recentBlogs = sortedPosts.filter(
        (p) => now - new Date(p.createdAt).getTime() <= oneWeek
      );

      const pickMostEngaging = (arr: BlogPost[]) => {
        if (arr.length === 0) return null;
        return arr.sort((a, b) => {
          const scoreA =
            (a.description?.length || 0) +
            (a.title?.split(" ").length || 0) * 5 +
            Math.random() * 10;
          const scoreB =
            (b.description?.length || 0) +
            (b.title?.split(" ").length || 0) * 5 +
            Math.random() * 10;
          return scoreB - scoreA;
        })[0];
      };

      const weekly = pickMostEngaging(recentBlogs) || sortedPosts[0];
      setWeeklyHot(weekly);

      setPosts(sortedPosts);
    } else if (!loading && !error) {
      setPosts([]);
      setFeaturedPost(null);
      setWeeklyHot(null);
    }
  }, [data, loading, error]);

  const remainingPosts = posts.filter(
    (p) => p !== weeklyHot && p !== featuredPost
  );

  const latestBlogs = [...posts]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <main className="max-w-screen-xl mx-auto p-4">
      {featuredPost && <FeaturedBlog post={featuredPost} />}
      {loading && <Loader />}
      {error && (
        <p className="text-red-500 text-center">
          Error fetching blogs: {error.message}
        </p>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          {/* 📰 Weekly Hot + 2 Blogs + Newly Added */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            {/* 🧱 Weekly Hot (Big Card) */}
{weeklyHot && (
  <Link
    href={`/blogs/${weeklyHot.slug}`}
    className="relative block lg:col-span-2 rounded-lg overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
  >
    {weeklyHot.cover && (
      <img
        src={weeklyHot.cover}
        alt={weeklyHot.title}
        className="w-full h-[350px] object-cover group-hover:scale-105 transition-transform duration-500"
      />
    )}

    {/* ✅ Dynamic overlay based on theme */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-gray-900/90 dark:via-gray-800/60 dark:to-transparent transition-colors duration-300"></div>

    {/* ✅ Dynamic text & button color */}
    <div className="absolute bottom-0 left-0 right-0 p-8 text-white dark:text-gray-100 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded">
          🔥 Trending This Week
        </span>
      </div>
      <h3 className="font-extrabold text-2xl md:text-3xl mb-1 leading-tight">
        {weeklyHot.title}
      </h3>
      <p className="text-gray-200 dark:text-gray-300 line-clamp-8 mb-3 text-sm md:text-base">
        {weeklyHot.description}
      </p>

      <span className="inline-block bg-white dark:bg-gray-100 dark:text-gray-900 text-black px-3 py-1.5 rounded font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-200 transition">
        Read More →
      </span>
    </div>
  </Link>
)}


            {/* 🧩 Two Compact Blogs */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {remainingPosts.slice(0, 2).map((p) => (
                <Link
                  key={p.slug}
                  href={`/blogs/${p.slug}`}
                  className="block border rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300"
                >
                  {p.cover && (
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                 <div className="p-4 bg-white dark:bg-gray-900 transition-colors duration-300">
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

            {/* 🆕 Newly Added Blogs (Fixed Right Sidebar) */}
      <aside
         className="bg-black text-white dark:bg-white dark:text-gray-900 rounded-lg shadow-md p-5 
         max-h-[650px] overflow-y-auto sticky top-[0px] lg:col-span-1 transition-colors duration-300"
          >
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

          {/* 🧾 Remaining Posts Grid (unchanged) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-10 mt-8 auto-rows-fr">
            {remainingPosts.slice(2).map((p) => (
              <Link
                key={p.slug}
                href={`/blogs/${p.slug}`}
                className="block flex flex-col w-full gap-2 border rounded-lg shadow hover:shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
              >
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-4 bg-white dark:bg-gray-900 flex-1 transition-colors duration-300">
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
        </>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <ApolloProvider client={client}>
      <HomePageContent />
    </ApolloProvider>
  );
}
