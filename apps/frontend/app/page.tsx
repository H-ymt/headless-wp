import Link from "next/link";
import { getPosts } from "@/features/posts/lib/wordpress";

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
            {posts.map((post) => (
              <article key={post.id}>
                <h3 className="mb-2 text-xl">
                  <Link href={`/posts/${post.slug}`}>
                    {post.title.rendered}
                  </Link>
                </h3>
                <div
                  className="mb-4 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
                <div className="text-gray-400 text-sm">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("ja-JP")}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
