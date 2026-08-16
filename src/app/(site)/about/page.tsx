"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeContext";

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen px-6 py-16 flex flex-col items-center transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gradient-to-b from-purple-50 via-white to-purple-100 text-gray-900"
      }`}
    >
      {/* ✨ Title Section */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-8"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        About{" "}
        <span
          className={`fruktur-regular font-bold tracking-wide ${
            theme === "dark"
              ? "text-purple-400 hover:text-purple-300"
              : "text-purple-700 hover:text-purple-500"
          } transition-all duration-300`}
        >
          Mayukh-Blogs
        </span>
      </motion.h1>

      {/* 🌸 Decorative Line */}
      <motion.div
        className={`h-[3px] w-24 mb-10 rounded-full ${
          theme === "dark" ? "bg-purple-500" : "bg-purple-400"
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7 }}
      />

      {/* 📝 About Content */}
      <motion.div
        className={`max-w-3xl text-lg leading-relaxed font-light ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <p className="mb-5">
          <strong className="text-purple-500">Mayukh-Blogs</strong> is your
          go-to destination for all things{" "}
          <span className="font-semibold">Strapi</span> and{" "}
          <span className="font-semibold">Web Development</span>. We aim to
          simplify complex topics and help you build better, faster, and smarter
          with modern web tools.
        </p>

        <p className="mb-5">
          We believe learning is most effective when it’s community-driven.
          That’s why this platform is built for developers who love to explore,
          share, and grow together. You’ll find tutorials, deep dives, and
          practical insights that push your skills to the next level.
        </p>

        <p className="mb-5">
          Built with <strong>Next.js</strong> and <strong>Strapi</strong>,{" "}
          <strong>Mayukh-Blogs</strong> ensures speed, flexibility, and an
          elegant reading experience — no matter your device or theme.
        </p>

        <p>
          Whether you’re here to learn, contribute, or get inspired, you’re part
          of something bigger — a community of creators passionate about the
          web. 🌍✨
        </p>
      </motion.div>

      {/* 🌐 Closing Quote */}
      <motion.div
        className={`mt-12 italic text-center max-w-xl ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        “Code is more than syntax — it’s creativity, connection, and
        contribution.”
      </motion.div>

      {/* 🖤 Decorative Footer Line */}
      <motion.div
        className={`h-[2px] w-16 mt-8 rounded-full ${
          theme === "dark" ? "bg-purple-500/50" : "bg-purple-300/70"
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />

      {/* 🔙 Back to Blogs Button */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Link
          href="/"
          className={`px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-purple-600 hover:bg-purple-500 text-white"
              : "bg-purple-500 hover:bg-purple-600 text-white"
          }`}
        >
          ← Back to Blogs
        </Link>
      </motion.div>
    </div>
  );
}
