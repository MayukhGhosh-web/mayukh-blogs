// app/layout.tsx
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import ApolloWrapper from "@/components/ApolloWrapper";
import { ThemeProvider } from "@/components/ui/ThemeContext"; // ✅ import ThemeProvider
import "./globals.css";

// ✅ Custom local fonts (optional)
const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  title: "Mayukh-Blogs",
  description:
    "Your go-to resource for all things Strapi—explore best practices, tips, and community insights to elevate your projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fruktur:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen transition-colors duration-500 bg-white text-black dark:bg-gray-950 dark:text-white`}
      >
        {/* ✅ Wrap everything inside ThemeProvider */}
        <ThemeProvider>
          <ApolloWrapper>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" reverseOrder={false} />
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
