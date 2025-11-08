import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/wordpress";

export default async function Home() {
  const posts = await getPosts({ per_page: 3 });

  return (
    <div>
      <section className="mb-12">
        <h1 className="mb-4 font-bold text-4xl text-gray-900">
          Headless WordPress + Next.js
        </h1>
        <p className="mb-6 text-gray-600 text-xl">
          WordPressをヘッドレスCMSとして使用し、Next.jsで構築されたモダンなWebサイトです。
        </p>
        <Link
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          href="/posts"
        >
          投稿一覧を見る
        </Link>
      </section>

      <section>
        <h2 className="mb-6 font-bold text-2xl text-gray-900">最新の投稿</h2>
        {posts.length === 0 ? (
          <p className="text-gray-600">投稿がありません。</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                key={post.id}
              >
                {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      alt={
                        post._embedded["wp:featuredmedia"][0].alt_text ||
                        post.title.rendered
                      }
                      className="object-cover"
                      fill
                      src={post._embedded["wp:featuredmedia"][0].source_url}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                    <Link
                      className="transition-colors hover:text-blue-600"
                      href={`/posts/${post.slug}`}
                    >
                      {post.title.rendered}
                    </Link>
                  </h3>
                  <div
                    className="mb-4 line-clamp-3 text-gray-600 text-sm"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("ja-JP")}
                    </time>
                    {post._embedded?.author?.[0] && (
                      <span>{post._embedded.author[0].name}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
