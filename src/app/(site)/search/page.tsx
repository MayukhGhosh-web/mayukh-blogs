"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBlogsBySearch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    getBlogsBySearch(query)
      .then((data) => setResults(data || []))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <motion.h1
        className="text-2xl font-bold text-purple-800 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Search Results
      </motion.h1>

      {query && (
        <motion.p
          className="mb-4 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Showing results for: <strong>{query}</strong>
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.p
            key="loading"
            className="text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Loading...
          </motion.p>
        )}

        {!loading && results.length === 0 && query && (
          <motion.p
            key="no-results"
            className="text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            No results found for "{query}".
          </motion.p>
        )}

        {!loading && results.length > 0 && (
          <motion.div
            key="results"
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {results.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/blogs/${post.slug}`}
                  className="flex gap-4 p-4 border border-purple-700 rounded hover:bg-purple-900 transition"
                >
                  {post.cover && (
                    <motion.img
                      src={post.cover}
                      alt={post.title}
                      className="w-24 h-24 object-cover rounded"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {post.title}
                    </h2>
                    <p className="text-gray-300">{post.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 p-4">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
