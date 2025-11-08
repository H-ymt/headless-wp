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
      <h1 className="mb-8 text-3xl">ログイン</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="mb-2 block text-sm" htmlFor="username">
            ユーザー名
          </label>
          <input
            className="w-full border-b px-2 py-2 focus:outline-none"
            id="username"
            onChange={(e) => setUsername(e.target.value)}
            required
            type="text"
            value={username}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm" htmlFor="password">
            パスワード
          </label>
          <input
            className="w-full border-b px-2 py-2 focus:outline-none"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <button
          className="w-full border py-2 disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      <div className="mt-8 text-gray-400 text-sm">
        <p className="mb-2">デフォルトのWordPressユーザー情報:</p>
        <ul className="space-y-1">
          <li>ユーザー名: admin</li>
          <li>パスワード: password</li>
        </ul>
      </div>
    </div>
  );
}
