import type { Post, PostsResponse } from "@/features/posts/types";

const WP_API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  `${process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888"}/wp-json/wp/v2`;

export async function getPosts(params?: {
  per_page?: number;
  page?: number;
  search?: string;
}): Promise<Post[]> {
  const searchParams = new URLSearchParams();

  if (params?.per_page) {
    searchParams.append("per_page", params.per_page.toString());
  }
  if (params?.page) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  searchParams.append("_embed", "true");

  const url = `${WP_API_URL}/posts?${searchParams.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Failed to fetch posts: ${res.status} ${res.statusText}. URL: ${url}. Error: ${errorText.slice(0, 200)}`
    );
  }

  return res.json();
}

export async function getPostsWithPagination(params?: {
  per_page?: number;
  page?: number;
}): Promise<PostsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("per_page", (params?.per_page ?? 10).toString());
  searchParams.append("page", (params?.page ?? 1).toString());
  searchParams.append("_embed", "true");

  const url = `${WP_API_URL}/posts?${searchParams.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Failed to fetch posts: ${res.status} ${res.statusText}. URL: ${url}. Error: ${errorText.slice(0, 200)}`
    );
  }

  const posts: Post[] = await res.json();
  const total = Number(res.headers.get("X-WP-Total") ?? 0);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 1);

  return { posts, total, totalPages };
}

export async function getPostBySlug(
  slug: string,
  options?: { status?: "publish" | "draft"; token?: string }
): Promise<Post | null> {
  const searchParams = new URLSearchParams();
  searchParams.append("slug", slug);
  searchParams.append("_embed", "true");
  if (options?.status) {
    searchParams.append("status", options.status);
  }

  const url = `${WP_API_URL}/posts?${searchParams.toString()}`;
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers,
  });

  if (!res.ok) {
    return null;
  }

  const posts: Post[] = await res.json();
  return posts[0] ?? null;
}

export async function getPostById(id: number): Promise<Post | null> {
  const url = `${WP_API_URL}/posts/${id}?_embed=true`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function getDraftPostById(
  id: number,
  token: string
): Promise<Post | null> {
  const url = `${WP_API_URL}/posts/${id}?_embed=true&status=draft`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
