import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/features/categories/lib/wordpress";

export const metadata: Metadata = {
  title: "カテゴリー一覧",
  description: "WordPressのカテゴリー一覧ページです。",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const filtered = categories.filter((c) => c.count > 0);

  return (
    <div>
      <h1 className="mb-12 text-3xl">カテゴリー</h1>
      {filtered.length === 0 ? (
        <p>カテゴリーがありません。</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((category) => (
            <li key={category.id}>
              <Link
                className="flex flex-col rounded border p-4 hover:bg-gray-50"
                href={`/categories/${category.slug}`}
              >
                <span className="font-medium">{category.name}</span>
                <span className="mt-1 text-gray-500 text-sm">
                  {category.count}件
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
