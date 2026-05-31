import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888";

export const metadata: Metadata = {
  title: {
    default: "Headless WordPress",
    template: "%s | Headless WordPress",
  },
  description:
    "WordPressをヘッドレスCMSとして使用し、Next.jsで構築されたWebサイトです。",
  openGraph: {
    type: "website",
    siteName: "Headless WordPress",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
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
                <Link className="font-medium text-sm" href="/">
                  ホーム
                </Link>
                <Link className="font-medium text-sm" href="/posts">
                  投稿
                </Link>
                <Link className="font-medium text-sm" href="/categories">
                  カテゴリー
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
