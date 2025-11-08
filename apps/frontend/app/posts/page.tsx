import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/features/posts/lib/wordpress";
import { sanitizeHTML } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "投稿一覧 | Headless WordPress",
  description: "WordPressの投稿一覧ページです。",
};

export default async function PostsPage() {
  const posts = await getPosts({ per_page: 10 });

  return (
    <div>
      <h1 className="mb-12 text-3xl">投稿一覧</h1>
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
                <h2 className="mb-2 text-xl">
                  <Link href={`/posts/${post.slug}`}>
                    {post.title.rendered}
                  </Link>
                </h2>
                <div
                  className="mb-4 text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(post.excerpt.rendered),
                  }}
                />
                <div className="text-gray-500 text-sm">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("ja-JP")}
                  </time>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
