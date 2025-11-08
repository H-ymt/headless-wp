const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888";
const WP_API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || `${WP_URL}/wp-json/wp/v2`;

export type Post = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
      slug: string;
    }>;
  };
};

export type User = {
  id: number;
  name: string;
  slug: string;
  email: string;
};

/**
 * WordPress REST APIから投稿一覧を取得
 */
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
  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Failed to fetch posts: ${res.status} ${res.statusText}. URL: ${url}. Error: ${errorText.slice(0, 200)}`
    );
  }

  return res.json();
}

/**
 * WordPress REST APIから投稿を取得（スラッグで）
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const searchParams = new URLSearchParams();
  searchParams.append("slug", slug);
  searchParams.append("_embed", "true");

  const url = `${WP_API_URL}/posts?${searchParams.toString()}`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return null;
  }

  const posts: Post[] = await res.json();
  return posts[0] || null;
}

/**
 * WordPress REST APIから投稿を取得（IDで）
 */
export async function getPostById(id: number): Promise<Post | null> {
  const url = `${WP_API_URL}/posts/${id}?_embed=true`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

/**
 * WordPress REST APIから現在のユーザー情報を取得
 */
export async function getCurrentUser(token: string): Promise<User | null> {
  const url = `${WP_URL}/wp-json/wp/v2/users/me`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
