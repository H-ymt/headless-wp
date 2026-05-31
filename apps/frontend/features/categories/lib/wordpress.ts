import type { Category } from "@/features/categories/types";
import type { Post, PostsResponse } from "@/features/posts/types";

const WP_API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  `${process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888"}/wp-json/wp/v2`;

export async function getCategories(): Promise<Category[]> {
  const url = `${WP_API_URL}/categories?per_page=100&_fields=id,name,slug,description,count,parent`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Failed to fetch categories: ${res.status} ${res.statusText}. Error: ${errorText.slice(0, 200)}`
    );
  }

  return res.json();
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const url = `${WP_API_URL}/categories?slug=${encodeURIComponent(slug)}&_fields=id,name,slug,description,count,parent`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return null;
  }

  const categories: Category[] = await res.json();
  return categories[0] ?? null;
}

export async function getPostsByCategory(
  categoryId: number,
  params?: { per_page?: number; page?: number }
): Promise<PostsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("categories", categoryId.toString());
  searchParams.append("per_page", (params?.per_page ?? 10).toString());
  searchParams.append("page", (params?.page ?? 1).toString());
  searchParams.append("_embed", "true");

  const url = `${WP_API_URL}/posts?${searchParams.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Failed to fetch posts by category: ${res.status} ${res.statusText}. Error: ${errorText.slice(0, 200)}`
    );
  }

  const posts: Post[] = await res.json();
  const total = Number(res.headers.get("X-WP-Total") ?? 0);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 1);

  return { posts, total, totalPages };
}
