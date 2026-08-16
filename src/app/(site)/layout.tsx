// app/(site)/layout.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ui/ThemeContext"; // ✅ import ThemeProvider

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-500 bg-white text-black dark:bg-gray-950 dark:text-white">
      {/* ✅ Wrap everything inside ThemeProvider */}
      <ThemeProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" reverseOrder={false} />
      </ThemeProvider>
    </div>
  );
}
