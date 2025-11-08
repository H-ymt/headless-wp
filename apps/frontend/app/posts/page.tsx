import Link from "next/link";
import { cleanWordPressHTML } from "@/features/blocks/lib/blocks";
import { getPosts } from "@/features/posts/lib/wordpress";

export default async function PostsPage() {
  const posts = await getPosts({ per_page: 10 });

  return (
    <div>
      <h1 className="mb-12 text-3xl">投稿一覧</h1>
      {posts.length === 0 ? (
        <p>投稿がありません。</p>
      ) : (
        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.id}>
              <h2 className="mb-2 text-xl">
                <Link href={`/posts/${post.slug}`}>{post.title.rendered}</Link>
              </h2>
              <div
                className="mb-4 text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: cleanWordPressHTML(post.excerpt.rendered),
                }}
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
    </div>
  );
}
