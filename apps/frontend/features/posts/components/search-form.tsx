"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  defaultValue?: string;
};

export function SearchForm({ defaultValue }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("search") ?? defaultValue ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const value = (
      form.elements.namedItem("search") as HTMLInputElement
    ).value.trim();
    const params = new URLSearchParams();
    if (value) {
      params.set("search", value);
    }
    router.push(`/posts${params.size > 0 ? `?${params.toString()}` : ""}`);
  }

  return (
    <form className="mb-8 flex gap-2" onSubmit={handleSubmit}>
      <input
        className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        defaultValue={current}
        name="search"
        placeholder="キーワードで検索"
        type="search"
      />
      <button
        className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
        type="submit"
      >
        検索
      </button>
    </form>
  );
}
