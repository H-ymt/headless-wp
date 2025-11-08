import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AuthButton from "@/components/auth-button";

export const metadata: Metadata = {
  title: "Headless WordPress",
  description: "Headless WordPress with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Link className="font-bold text-2xl text-gray-900" href="/">
                Headless WP
              </Link>
              <nav className="flex items-center gap-4">
                <Link className="text-gray-700 hover:text-gray-900" href="/">
                  ホーム
                </Link>
                <Link
                  className="text-gray-700 hover:text-gray-900"
                  href="/posts"
                >
                  投稿一覧
                </Link>
                <AuthButton />
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="mt-12 border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600">
              © 2024 Headless WordPress. Powered by Next.js
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
