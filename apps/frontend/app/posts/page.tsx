import Image from "next/image";
import Link from "next/link";
import { cleanWordPressHTML, getPosts } from "@/lib/wordpress";

export default async function PostsPage() {
  const posts = await getPosts({ per_page: 10 });

  return (
    <div>
      <h1 className="mb-8 font-bold text-3xl text-gray-900">投稿一覧</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600">投稿がありません。</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              key={post.id}
            >
              <div className="md:flex">
                {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                  <div className="relative h-64 w-full md:h-full md:w-1/3">
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
                <div
                  className={`p-6 ${post._embedded?.["wp:featuredmedia"]?.[0] ? "md:w-2/3" : "w-full"}`}
                >
                  <h2 className="mb-3 font-semibold text-2xl text-gray-900">
                    <Link
                      className="transition-colors hover:text-blue-600"
                      href={`/posts/${post.slug}`}
                    >
                      {post.title.rendered}
                    </Link>
                  </h2>
                  <div
                    className="mb-4 line-clamp-3 text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: cleanWordPressHTML(post.excerpt.rendered),
                    }}
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
