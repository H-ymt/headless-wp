# Headless WordPress + Next.js テンプレート

WordPress をヘッドレス CMS として使用し、Next.js 16 で構築されたモダンな Web サイトのテンプレートです。

## 特徴

- **WordPress**: wp-env を使用したローカル開発環境
- **Next.js 16**: App Router を使用した最新の Next.js
- **TypeScript**: 型安全な開発
- **Tailwind CSS v4**: 設定ファイルなしのモダンなスタイリング
- **JWT 認証**: WordPress REST API との認証機能

## セットアップ

### 必要な環境

- Node.js 22 以上
- pnpm 9 以上
- Docker Desktop（wp-env 用）

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. WordPress 環境の起動

```bash
cd wordpress
npx wp-env start
```

WordPress が起動したら、以下の URL でアクセスできます：

- WordPress 管理画面: http://localhost:8888/wp-admin
- WordPress サイト: http://localhost:8888

デフォルトのログイン情報：

- ユーザー名: `admin`
- パスワード: `password`

### 3. JWT 認証プラグインの設定

WordPress 管理画面にログイン後、以下の手順で JWT 認証を有効化します：

1. プラグイン → インストール済みプラグイン
2. 「JWT Authentication for WP REST API」を有効化
3. 設定 → パーマリンク設定
4. 「変更を保存」をクリック（パーマリンク構造を更新）

### 4. 環境変数の設定

`apps/frontend/.env.local.example`をコピーして`apps/frontend/.env.local`を作成：

```bash
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

必要に応じて環境変数を調整してください。

### 5. 開発サーバーの起動

**まとめて起動（推奨）**

1 つのコマンドで WordPress と Next.js を同時に起動：

```bash
pnpm run dev
```

WordPress の起動を待ってから Next.js が自動的に起動します。

**個別に起動**

**ターミナルウィンドウ 1（WordPress）:**

```bash
pnpm run wp:start
```

**ターミナルウィンドウ 2（Next.js）:**

```bash
pnpm --filter @headless-wp/frontend dev
```

ブラウザで http://localhost:3000 を開いて確認できます。

## プロジェクト構造

```
.
├── apps/
│   └── frontend/           # Next.js アプリケーション
│       ├── app/            # Next.js App Router
│       │   ├── layout.tsx # ルートレイアウト
│       │   ├── page.tsx   # ホームページ
│       │   ├── posts/     # 投稿関連ページ
│       │   │   ├── page.tsx        # 投稿一覧
│       │   │   └── [slug]/         # 投稿詳細（動的ルート）
│       │   └── login/     # ログインページ
│       ├── components/    # Reactコンポーネント
│       │   └── AuthButton.tsx      # 認証ボタン
│       ├── lib/           # ユーティリティ関数
│       │   ├── wordpress.ts        # WordPress REST APIクライアント
│       │   └── auth.ts            # JWT認証ヘルパー
│       └── package.json   # フロントエンド依存関係
├── packages/              # 共有ライブラリ用（将来的に使用）
│   └── shared/           # 共有型定義・ユーティリティ
├── wordpress/            # WordPress 設定とコンテンツ
│   ├── .wp-env.json      # wp-env設定
│   ├── wp-content/       # WordPress コンテンツ
│   │   ├── plugins/
│   │   └── themes/
│   └── package.json      # WordPress パッケージ設定
├── pnpm-workspace.yaml   # pnpm workspaces 設定
└── package.json          # ルート依存関係
```

## 使用方法

### 投稿の取得

```typescript
import { getPosts, getPostBySlug } from "@/lib/wordpress";

// 投稿一覧を取得
const posts = await getPosts({ per_page: 10 });

// スラッグで投稿を取得
const post = await getPostBySlug("my-post-slug");
```

### 認証

```typescript
import { login, logout, isAuthenticated } from "@/lib/auth";

// ログイン
await login({ username: "admin", password: "password" });

// ログアウト
logout();

// 認証状態を確認
if (isAuthenticated()) {
  // 認証済み
}
```

## ビルド

```bash
pnpm run build
pnpm start
```

## 日常的な起動方法

### まとめて起動（推奨）

```bash
# WordPress と Next.js を同時に起動
pnpm run dev
```

### 個別に起動

**ターミナル 1（WordPress）:**

```bash
pnpm run wp:start
```

**ターミナル 2（Next.js）:**

```bash
pnpm --filter @headless-wp/frontend dev
```

## 停止方法

- WordPress と Next.js をまとめて停止: `Ctrl + C`（dev 実行時）
- WordPress のみ停止: `pnpm run wp:stop`
- Next.js のみ停止: `Ctrl + C`（フロントエンド dev 実行時）

## トラブルシューティング

### WordPress に接続できない

1. wp-env が起動しているか確認: `cd wordpress && npx wp-env info`
2. `apps/frontend/.env.local`の URL が正しいか確認
3. WordPress のパーマリンク設定を更新

### JWT 認証が動作しない

1. プラグインが有効化されているか確認
2. WordPress のパーマリンク設定を更新
3. `.htaccess`ファイルが正しく設定されているか確認（wp-env では自動設定）

### pnpm の権限エラーが発生する

`EACCES: permission denied` エラーが発生する場合、`.zshrc`（または`.bashrc`）の pnpm 設定が古いユーザーを参照している可能性があります。

以下のコマンドで確認：

```bash
grep PNPM_HOME ~/.zshrc
```

古いユーザー名が含まれている場合は、以下のように修正してください：

```bash
# .zshrc を編集
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
```

または、Volta を使用している場合：

```bash
export PNPM_HOME="$HOME/.volta/bin"
export PATH="$PNPM_HOME:$PATH"
```

設定を反映するには、新しいターミナルを開くか、以下を実行：

```bash
source ~/.zshrc
```

## ライセンス

MIT
