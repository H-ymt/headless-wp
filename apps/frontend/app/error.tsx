"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをログに記録（本番環境ではエラートラッキングサービスに送信）
    console.error("[ErrorBoundary] Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8">
        <h1 className="mb-4 font-bold text-2xl text-red-800">
          エラーが発生しました
        </h1>
        <p className="mb-6 text-red-700">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6">
            <summary className="mb-2 cursor-pointer font-semibold text-red-800 text-sm">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="overflow-auto rounded bg-red-100 p-4 text-red-900 text-xs">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex gap-4">
          <button
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={reset}
            type="button"
          >
            もう一度試す
          </button>
          <a
            className="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
            href="/"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
