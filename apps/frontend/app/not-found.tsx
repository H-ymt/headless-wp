import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-6xl text-gray-800">404</h1>
        <h2 className="mb-4 font-semibold text-2xl text-gray-700">
          ページが見つかりません
        </h2>
        <p className="mb-8 text-gray-600">
          お探しのページは存在しないか、移動または削除された可能性があります。
        </p>
        <div className="flex justify-center gap-4">
          <Link
            className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            href="/"
          >
            ホームに戻る
          </Link>
          <Link
            className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
            href="/posts"
          >
            投稿一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
