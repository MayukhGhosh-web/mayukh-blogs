"use client";
import { useTheme } from "@/components/ui/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
                 hover:scale-110 transition-transform duration-300"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
