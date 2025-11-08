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
      <body className="min-h-screen bg-white">
        <header className="border-b">
          <div className="mx-auto max-w-4xl px-6">
            <div className="flex items-center justify-between py-4">
              <Link className="text-xl" href="/">
                Headless WP
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/">ホーム</Link>
                <Link href="/posts">投稿</Link>
                <AuthButton />
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
