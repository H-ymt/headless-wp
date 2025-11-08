import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sanitizeHTML } from "@/lib/sanitize";
import { getPosts } from "@/features/posts/lib/wordpress";

export const metadata: Metadata = {
  title: "Headless WordPress",
  description: "WordPressをヘッドレスCMSとして使用し、Next.jsで構築されたWebサイトです。",
};

export default async function Home() {
  const posts = await getPosts({ per_page: 3 });

  return (
    <div>
      <section className="mb-16">
        <h1 className="mb-4 text-3xl">Headless WordPress + Next.js</h1>
        <p className="mb-8 text-gray-600">
          WordPressをヘッドレスCMSとして使用し、Next.jsで構築されたWebサイトです。
        </p>
        <Link href="/posts">投稿一覧を見る →</Link>
      </section>

      <section>
        <h2 className="mb-8 text-xl">最新の投稿</h2>
        {posts.length === 0 ? (
          <p>投稿がありません。</p>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => {
              const featuredImage =
                post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              return (
                <article key={post.id}>
                  {featuredImage && (
                    <div className="mb-4 aspect-video w-full overflow-hidden rounded">
                      <Image
                        alt={
                          post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
                          post.title.rendered
                        }
                        className="h-full w-full object-cover"
                        height={400}
                        src={featuredImage}
                        width={800}
                      />
                    </div>
                  )}
                  <h3 className="mb-2 text-xl">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title.rendered}
                    </Link>
                  </h3>
                  <div
                    className="mb-4 text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHTML(post.excerpt.rendered),
                    }}
                  />
                  <div className="text-gray-400 text-sm">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("ja-JP")}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
