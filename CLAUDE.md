# AI エージェント用ドキュメント

## プロジェクト概要

このプロジェクトは WordPress をヘッドレス CMS として使用し、Next.js 16 で構築された Web サイトのテンプレートです。WordPress は wp-env（Docker ベース）でローカル環境を構築し、Next.js のフロントエンドから WordPress REST API 経由でコンテンツを取得します。JWT 認証により WordPress への認証機能も実装されています。

## 必要な環境

- Node.js 22 以上
- pnpm 9 以上（パッケージマネージャー）
- Docker Desktop（wp-env 用）

## 重要なコマンド

### 開発環境の起動

```bash
# WordPress と Next.js を同時に起動（推奨）
pnpm run dev

# WordPress のみ起動
pnpm run wp:start

# Next.js のみ起動（WordPress が起動済みの場合）
pnpm --filter @headless-wp/frontend dev
```

`pnpm run dev` は concurrently を使用して WordPress の起動を待ってから Next.js を自動起動します。

### WordPress 環境管理

```bash
# WordPress 環境の初回起動（wordpress ディレクトリから実行）
cd wordpress && npx wp-env start

# WordPress 環境の停止
pnpm run wp:stop

# WordPress 環境の情報確認
pnpm run wp:info
```

### ビルドとリント

```bash
# プロダクションビルド
pnpm run build

# プロダクション起動
pnpm start

# リント
pnpm run lint
```

### 初回セットアップ

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 3. WordPress 環境起動
npx wp-env start

# 4. WordPress 管理画面で JWT プラグインを有効化
# http://localhost:8888/wp-admin (admin/password)
# プラグイン → 「JWT Authentication for WP REST API」を有効化
# 設定 → パーマリンク設定 → 「変更を保存」をクリック

# 5. 開発サーバー起動
pnpm run dev
```

## アーキテクチャ

### 全体構成

- **WordPress（wp-env）**: ポート 8888 でバックエンド API を提供
- **Next.js 16（App Router）**: ポート 3000 でフロントエンドを提供
- **通信**: Next.js から WordPress REST API を呼び出し、JWT で認証

### ディレクトリ構造とレイヤー

このプロジェクトは **feature-based構造** を採用しています。機能ごとにコードが集約され、関連するコードが近くに配置されます。

```
apps/
└── frontend/            # Next.js アプリケーション
    ├── app/             # Next.js App Router（ページレイヤー）
    │   ├── layout.tsx   # ルートレイアウト
    │   ├── page.tsx     # ホームページ
    │   ├── posts/       # 投稿関連ページ
    │   │   ├── page.tsx # 投稿一覧ページ
    │   │   └── [slug]/  # 動的ルート（投稿詳細）
    │   └── login/       # ログインページ
    │
    ├── features/        # 機能別ディレクトリ（Feature-based構造）
    │   ├── posts/       # 投稿機能
    │   │   ├── components/  # 投稿関連コンポーネント
    │   │   ├── lib/         # 投稿関連のロジック
    │   │   │   └── wordpress.ts  # WordPress API（posts関連）
    │   │   └── types.ts     # Post型定義
    │   │
    │   ├── auth/        # 認証機能
    │   │   ├── components/  # 認証関連コンポーネント
    │   │   │   └── auth-button.tsx  # 認証ボタン
    │   │   ├── lib/         # 認証関連のロジック
    │   │   │   └── auth.ts  # JWT認証ヘルパー
    │   │   └── types.ts     # 認証関連の型定義
    │   │
    │   └── blocks/      # ブロックレンダリング機能
    │       ├── components/  # ブロック関連コンポーネント
    │       │   └── block-renderer.tsx  # ブロックレンダラー
    │       ├── lib/         # ブロック関連のロジック
    │       │   └── blocks.ts  # ブロックパーサー
    │       └── types.ts     # Block型定義
    │
    ├── components/      # 共通UIコンポーネント（将来的に追加）
    │
    └── lib/             # 共通ユーティリティ
        └── wordpress-common.ts  # WordPress共通関数（getCurrentUserなど）

wordpress/               # WordPress 設定とコンテンツ
├── .wp-env.json         # wp-env 設定
└── wp-content/         # WordPress コンテンツディレクトリ
```

### データフロー

1. **投稿の取得**: `features/posts/lib/wordpress.ts` の関数を使用して WordPress REST API からデータを取得
2. **認証**: `features/auth/lib/auth.ts` の関数を使用して JWT トークンを管理
3. **画像**: `next.config.js` で WordPress の画像ドメイン（localhost:8888）を許可

### 重要な設計パターン

#### WordPress REST API との通信

- `features/posts/lib/wordpress.ts` に投稿関連の API 呼び出しロジックを集約
- `lib/wordpress-common.ts` に共通の WordPress API 関数を配置（`getCurrentUser` など）
- 環境変数 `NEXT_PUBLIC_WP_URL` と `NEXT_PUBLIC_WP_API_URL` で接続先を管理（`apps/frontend/.env.local` に設定）
- `_embed=true` パラメータでアイキャッチ画像や著者情報を同時取得
- Next.js の `next.revalidate` で 60 秒キャッシュを設定

#### JWT 認証

- `features/auth/lib/auth.ts` はクライアントサイド専用（`'use client'` ディレクティブ）
- トークンは localStorage に保存（`wp_jwt_token` キー）
- `getAuthHeaders()` で Authorization ヘッダーを生成
- WordPress の JWT プラグイン（jwt-authentication-for-wp-rest-api）を使用

#### WordPress 環境（wp-env）

- `wordpress/.wp-env.json` で環境を定義
- PHP 8.3、WordPress 最新版
- JWT プラグインは自動インストール（ただし手動で有効化が必要）
- デバッグモード有効（`WP_DEBUG: true`）
- `wordpress/wp-content/plugins` と `wordpress/wp-content/themes` をローカルディレクトリにマッピング

## 開発時の注意点

### WordPress の起動確認

`pnpm run dev` を実行する前に Docker Desktop が起動していることを確認してください。WordPress が起動しない場合、Next.js も起動しません。

### 環境変数

本番環境では `.env.local` の URL を実際の WordPress サーバーの URL に変更してください。

### パーマリンク設定

JWT 認証が動作しない場合、WordPress 管理画面でパーマリンク設定を一度保存し直してください（`.htaccess` の更新が必要なため）。

### 型定義

WordPress REST API のレスポンス型は各機能の `types.ts` ファイルで定義されています：
- 投稿関連: `features/posts/types.ts`
- 認証関連: `features/auth/types.ts`
- ブロック関連: `features/blocks/types.ts`

新しいエンドポイントを追加する場合は、対応する機能の `types.ts` に型定義を追加してください。

### 画像の最適化

Next.js の `next/image` コンポーネントを使用する場合、`apps/frontend/next.config.js` の `remotePatterns` に WordPress の画像ドメインを追加してください。

### モノレポ構造

このプロジェクトは pnpm workspaces を使用したモノレポ構造です：

- `apps/frontend/`: Next.js アプリケーション
- `wordpress/`: WordPress 設定とコンテンツ
- `packages/`: 共有ライブラリ用（将来的に使用）

ルートから各パッケージのコマンドを実行する場合は `pnpm --filter <package-name> <command>` を使用します。

## 設計作業ルール

設計作業を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## GitHub 操作ルール

- ユーザーから PR を出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってから PR を出すようにする
- ユーザーから commit して、と言われたときは、必ず `git status`や`git diff`を行い、変更内容を確認してから conventional commit 形式でコミットメッセージを作成し、コミットを行うようにする
- 重要: ユーザーから明示的な指示があるまでコミットしないこと
- develop や main への直接 push は禁止です
- PR 作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください
