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
pnpm run dev:next
```

`pnpm run dev` は concurrently を使用して WordPress の起動を待ってから Next.js を自動起動します。

### WordPress 環境管理

```bash
# WordPress 環境の初回起動
npx wp-env start

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
cp .env.local.example .env.local

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

```
app/                    # Next.js App Router（ページレイヤー）
├── layout.tsx          # ルートレイアウト
├── page.tsx            # ホームページ
├── posts/              # 投稿関連
│   ├── page.tsx        # 投稿一覧ページ
│   └── [slug]/         # 動的ルート（投稿詳細）
└── login/              # ログインページ

components/             # UI コンポーネント
└── AuthButton.tsx      # 認証状態に応じたボタン

lib/                    # ビジネスロジックとデータアクセス層
├── wordpress.ts        # WordPress REST API クライアント
└── auth.ts             # JWT 認証ヘルパー（クライアントサイド）
```

### データフロー

1. **投稿の取得**: `lib/wordpress.ts` の関数を使用して WordPress REST API からデータを取得
2. **認証**: `lib/auth.ts` の関数を使用して JWT トークンを管理
3. **画像**: `next.config.js` で WordPress の画像ドメイン（localhost:8888）を許可

### 重要な設計パターン

#### WordPress REST API との通信

- `lib/wordpress.ts` にすべての API 呼び出しロジックを集約
- 環境変数 `NEXT_PUBLIC_WP_URL` と `NEXT_PUBLIC_WP_API_URL` で接続先を管理
- `_embed=true` パラメータでアイキャッチ画像や著者情報を同時取得
- Next.js の `next.revalidate` で 60 秒キャッシュを設定

#### JWT 認証

- `lib/auth.ts` はクライアントサイド専用（`'use client'` ディレクティブ）
- トークンは localStorage に保存（`wp_jwt_token` キー）
- `getAuthHeaders()` で Authorization ヘッダーを生成
- WordPress の JWT プラグイン（jwt-authentication-for-wp-rest-api）を使用

#### WordPress 環境（wp-env）

- `.wp-env.json` で環境を定義
- PHP 8.3、WordPress 最新版
- JWT プラグインは自動インストール（ただし手動で有効化が必要）
- デバッグモード有効（`WP_DEBUG: true`）
- `wp-content/plugins` と `wp-content/themes` をローカルディレクトリにマッピング

## 開発時の注意点

### WordPress の起動確認

`pnpm run dev` を実行する前に Docker Desktop が起動していることを確認してください。WordPress が起動しない場合、Next.js も起動しません。

### 環境変数

本番環境では `.env.local` の URL を実際の WordPress サーバーの URL に変更してください。

### パーマリンク設定

JWT 認証が動作しない場合、WordPress 管理画面でパーマリンク設定を一度保存し直してください（`.htaccess` の更新が必要なため）。

### 型定義

WordPress REST API のレスポンス型は `lib/wordpress.ts` で定義されています。新しいエンドポイントを追加する場合は、対応する型定義も追加してください。

### 画像の最適化

Next.js の `next/image` コンポーネントを使用する場合、`next.config.js` の `remotePatterns` に WordPress の画像ドメインを追加してください。
