import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanWordPressHTML, getPostBySlug, getPosts } from "@/lib/wordpress";

export async function generateStaticParams() {
  try {
    const posts = await getPosts({ per_page: 100 });
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-md">
      {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
        <div className="relative h-96 w-full">
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
      <div className="p-8">
        <div className="mb-4">
          <Link
            className="text-blue-600 transition-colors hover:text-blue-800"
            href="/posts"
          >
            ← 投稿一覧に戻る
          </Link>
        </div>
        <h1 className="mb-4 font-bold text-4xl text-gray-900">
          {post.title.rendered}
        </h1>
        <div className="mb-6 flex items-center gap-4 text-gray-500 text-sm">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ja-JP")}
          </time>
          {post._embedded?.author?.[0] && (
            <span>投稿者: {post._embedded.author[0].name}</span>
          )}
        </div>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: cleanWordPressHTML(post.content.rendered),
          }}
        />
      </div>
    </article>
  );
}
