import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/features/categories/lib/wordpress";
import { sanitizeHTML } from "@/lib/sanitize";

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "カテゴリーが見つかりません" };
  }

  return {
    title: category.name,
    description: category.description || `${category.name}の投稿一覧です。`,
  };
}

const PER_PAGE = 10;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam ?? 1));

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { posts, totalPages } = await getPostsByCategory(category.id, {
    per_page: PER_PAGE,
    page: currentPage,
  });

  return (
    <div>
      <div className="mb-8">
        <Link className="flex items-center gap-2" href="/categories">
          ←<span className="pt-0.5">カテゴリー一覧に戻る</span>
        </Link>
      </div>
      <h1 className="mb-12 text-3xl">{category.name}</h1>
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
                  href={`/categories/${slug}?page=${currentPage - 1}`}
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
                    href={`/categories/${slug}?page=${page}`}
                    key={page}
                  >
                    {page}
                  </Link>
                )
              )}
              {currentPage < totalPages && (
                <Link
                  className="rounded border px-4 py-2 hover:bg-gray-100"
                  href={`/categories/${slug}?page=${currentPage + 1}`}
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
