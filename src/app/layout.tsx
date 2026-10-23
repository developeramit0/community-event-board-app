import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community Events Board",
  description: "Discover, explore, and personalize local events across your city.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4">
              <p>© 2026 Community Events Board. Built with Next.js, Prisma & TypeScript.</p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}