/** @type {import('next').NextConfig} */

// 正規表現をトップレベルで定義（パフォーマンス向上）
const DEFAULT_STYLESHEET_REGEX = /default-stylesheet\.css$/;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8888",
        pathname: "/wp-content/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドで jsdom の依存関係の問題を回避
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };

      // jsdom を external として扱う
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "commonjs canvas",
      });

      // jsdom の default-stylesheet.css の問題を回避
      // IgnorePlugin を使用して default-stylesheet.css を無視
      const webpack = require("webpack");
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: DEFAULT_STYLESHEET_REGEX,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
