export type User = {
  id: number;
  name: string;
  slug: string;
  email: string;
};

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888";

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
