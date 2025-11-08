import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888";

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
      <head>
        {/* フロントエンド用のブロックライブラリスタイル */}
        <link
          href={`${WP_URL}/wp-includes/css/dist/block-library/style.min.css`}
          rel="stylesheet"
        />
        <link
          href={`${WP_URL}/wp-includes/css/dist/block-library/theme.min.css`}
          rel="stylesheet"
        />
        {/* WordPressのリセットスタイル（エディタでも使用されている） */}
        <link
          href={`${WP_URL}/wp-includes/css/dist/block-library/reset.min.css`}
          rel="stylesheet"
        />
      </head>
      <body>
        <header>
          <div className="mx-auto max-w-4xl px-6">
            <div className="flex items-center justify-between py-6">
              <Link className="text-xl" href="/">
                Headless WP
              </Link>
              <nav
                aria-label="メインナビゲーション"
                className="flex items-center gap-6"
              >
                <Link href="/">ホーム</Link>
                <Link href="/posts">投稿</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
