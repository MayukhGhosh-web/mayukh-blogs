"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaTimes, FaBars, FaChevronDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/ui/ThemeContext"; // ✅ To detect light/dark mode

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { theme } = useTheme(); // ✅ Get current theme

  const categoryRef = useRef<HTMLDivElement>(null); // ✅ Ref for dropdown container

  // ✅ Fetch categories from Strapi
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:1337/api/categories");
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };

    if (categoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between p-4">
        {/* ✅ Logo (Light/Dark Switch) */}
        <Link href="/" className="flex items-center space-x-2">
          <div
            className={`rounded-xl overflow-hidden border transition-all duration-300 ${
              theme === "dark"
                ? "border-gray-700 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                : "border-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
            }`}
          >
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo.png"}
              alt="Mayukh Blog Logo"
              width={190}
              height={190}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-medium relative">
          <Link href="/" className="hover:text-red-400 transition-colors">
            Blogs
          </Link>

          {/* ✅ Category Dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setCategoryOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              Categories{" "}
              <FaChevronDown
                className={`transition-transform ${
                  categoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {categoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-lg border border-gray-200 dark:border-gray-700 z-20 w-48 text-left"
                >
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => {
                      const attrs = cat.attributes ?? cat;
                      return (
                        <Link
                          key={cat.id ?? attrs.slug}
                          href={`/categories/${attrs.slug}`}
                          onClick={() => setCategoryOpen(false)}
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {attrs.name}
                        </Link>
                      );
                    })
                  ) : (
                    <p className="px-4 py-2 text-gray-500">No categories</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search & Theme Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="text-xl hover:text-red-400 transition-colors"
              aria-label="Open Search"
            >
              <FaSearch />
            </button>
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* ✅ Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-gray-100 dark:bg-gray-800 px-4 pb-4 flex flex-col gap-3 overflow-hidden border-t border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100"
          >
            <Link
              href="/"
              className="hover:text-red-400 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Blogs
            </Link>

            {/* Mobile Categories */}
            <div>
              <button
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex items-center gap-1 hover:text-red-400 transition-colors"
              >
                Categories{" "}
                <FaChevronDown
                  className={`transition-transform ${
                    categoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {categoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 mt-2 flex flex-col gap-1"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.attributes.slug}`}
                          onClick={() => {
                            setMenuOpen(false);
                            setCategoryOpen(false);
                          }}
                          className="hover:text-red-400 transition-colors"
                        >
                          {cat.attributes.name}
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No categories</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <FaSearch /> Search
            </button>

            <div className="pt-2">
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-screen-lg mx-auto px-4 overflow-hidden mt-4"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-red-400 px-2"
              >
                <FaTimes />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Short (Unfinished) Bottom Line */}
      <div className="h-[2px] bg-black dark:bg-white w-[80%] mx-auto rounded-full opacity-70"></div>
    </header>
  );
};

export default Navbar;
