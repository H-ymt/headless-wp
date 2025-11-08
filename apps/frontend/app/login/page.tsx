"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-8 font-bold text-3xl text-gray-900">ログイン</h1>
      <form
        className="rounded-lg bg-white p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label
            className="mb-2 block font-medium text-gray-700 text-sm"
            htmlFor="username"
          >
            ユーザー名
          </label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="username"
            onChange={(e) => setUsername(e.target.value)}
            required
            type="text"
            value={username}
          />
        </div>
        <div className="mb-6">
          <label
            className="mb-2 block font-medium text-gray-700 text-sm"
            htmlFor="password"
          >
            パスワード
          </label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      <div className="mt-6 text-gray-600 text-sm">
        <p className="mb-2">デフォルトのWordPressユーザー情報:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>ユーザー名: admin</li>
          <li>パスワード: password</li>
        </ul>
      </div>
    </div>
  );
}
