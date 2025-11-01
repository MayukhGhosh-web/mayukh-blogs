"use client";

import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaGithub } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { useTheme } from "@/components/ui/ThemeContext"; // ✅ import theme context

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`transition-colors duration-300 border-t 
      ${
        theme === "dark"
          ? "bg-[#0d0d0d] border-gray-800 text-gray-300"
          : "bg-white border-gray-300 text-gray-800"
      }`}
    >
      <div className="max-w-screen-lg mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ✅ Logo + About */}
        <div className="flex flex-col items-start">
          <Link href="/" className="flex items-center">
            <div
              className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                theme === "dark"
                  ? "border-gray-700 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "border-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
              }`}
            >
              <Image
                src={theme === "dark" ? "/logo-dark.png" : "/logo.png"}
                alt="Crisp Blog's"
                width={190}
                height={190}
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <p
            className={`mt-3 text-sm italic transition-colors ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            “Made by Mayukh” — Your go-to Strapi & WebDev Blog.
          </p>
        </div>

        {/* ✅ Quick Links */}
        <div>
          <h2 className="font-semibold text-red-500 mb-3">Quick Links</h2>
          <ul className="flex flex-col gap-2">
            {["Blogs", "About", "Contact"].map((item, idx) => (
              <li key={idx}>
                <Link
                  href={`/${item === "Blogs" ? "" : item.toLowerCase()}`}
                  className={`transition-colors ${
                    theme === "dark"
                      ? "hover:text-red-400 text-gray-300"
                      : "hover:text-red-500 text-gray-800"
                  }`}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ Social Links */}
        <div>
          <h2 className="font-semibold text-red-500 mb-3">Follow Us</h2>
          <div className="flex gap-4">
            {[
              { href: "https://x.com/", icon: <FaTwitter size={20} /> },
              {
                href: "https://github.com/Mayukh-web",
                icon: <FaGithub size={20} />,
              },
              {
                href: "https://www.instagram.com/a._.lazy._.soul/",
                icon: <AiFillInstagram size={20} />,
              },
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  theme === "dark"
                    ? "hover:text-red-400 text-gray-300"
                    : "hover:text-red-500 text-gray-800"
                }`}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Copyright */}
      <div
        className={`py-4 text-sm text-center transition-colors ${
          theme === "dark" ? "text-gray-500" : "text-gray-600"
        }`}
      >
        © {new Date().getFullYear()} Crisp Blog’s by Mayukh. All rights reserved.
      </div>
    </footer>
  );
}
