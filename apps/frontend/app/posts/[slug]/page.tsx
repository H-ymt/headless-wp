import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/features/blocks/components/block-renderer";
import { getPostBySlug, getPosts } from "@/features/posts/lib/wordpress";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "投稿が見つかりません",
    };
  }

  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return {
    title: `${post.title.rendered} | Headless WordPress`,
    description: post.excerpt.rendered
      ? post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 160)
      : "WordPressの投稿ページです。",
    ...(featuredImage && {
      openGraph: {
        images: [featuredImage],
      },
    }),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    const featuredImage =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    return (
      <article>
        <div className="mb-8">
          <Link href="/posts">← 投稿一覧に戻る</Link>
        </div>
        {featuredImage && (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded">
            <Image
              alt={
                post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
                post.title.rendered
              }
              className="h-full w-full object-cover"
              height={600}
              src={featuredImage}
              width={1200}
            />
          </div>
        )}
        <h1 className="mb-4 text-3xl">{post.title.rendered}</h1>
        <div className="mb-8 text-gray-400 text-sm">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ja-JP")}
          </time>
        </div>
        <div className="prose max-w-none">
          <BlockRenderer html={post.content.rendered || ""} />
        </div>
      </article>
    );
  } catch (error) {
    console.error("[PostPage] Error rendering post:", error);
    throw error;
  }
}
