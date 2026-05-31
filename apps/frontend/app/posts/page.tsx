import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPostsWithPagination } from "@/features/posts/lib/wordpress";
import { sanitizeHTML } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "投稿一覧 | Headless WordPress",
  description: "WordPressの投稿一覧ページです。",
};

const PER_PAGE = 10;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam ?? 1));

  const { posts, totalPages } = await getPostsWithPagination({
    per_page: PER_PAGE,
    page: currentPage,
  });

  return (
    <div>
      <h1 className="mb-12 text-3xl">投稿一覧</h1>
      {posts.length === 0 ? (
        <p>投稿がありません。</p>
      ) : (
        <>
          <div className="space-y-12">
            {posts.map((post) => {
              const featuredImage =
                post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const authorName = post._embedded?.author?.[0]?.name;

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
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("ja-JP")}
                    </time>
                    {authorName && <span>{authorName}</span>}
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="ページネーション"
              className="mt-16 flex justify-center gap-2"
            >
              {currentPage > 1 && (
                <Link
                  className="rounded border px-4 py-2 hover:bg-gray-100"
                  href={`/posts?page=${currentPage - 1}`}
                >
                  前へ
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Link
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`rounded border px-4 py-2 ${
                      page === currentPage
                        ? "bg-gray-900 text-white"
                        : "hover:bg-gray-100"
                    }`}
                    href={`/posts?page=${page}`}
                    key={page}
                  >
                    {page}
                  </Link>
                )
              )}
              {currentPage < totalPages && (
                <Link
                  className="rounded border px-4 py-2 hover:bg-gray-100"
                  href={`/posts?page=${currentPage + 1}`}
                >
                  次へ
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
