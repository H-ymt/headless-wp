"use client";

const WP_JWT_URL =
  process.env.NEXT_PUBLIC_WP_JWT_URL ||
  "http://localhost:8888/wp-json/jwt-auth/v1";
const TOKEN_KEY = "wp_jwt_token";

import type { LoginCredentials, LoginResponse } from "@/features/auth/types";

/**
 * JWTトークンをローカルストレージに保存
 */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * ローカルストレージからJWTトークンを取得
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * ローカルストレージからJWTトークンを削除
 */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * WordPressにログインしてJWTトークンを取得
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const res = await fetch(`${WP_JWT_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    let errorMessage = "ログインに失敗しました";
    try {
      const error = await res.json();
      errorMessage = error.message || error.data?.message || errorMessage;
    } catch {
      // JSONパースに失敗した場合、ステータステキストを使用
      errorMessage = `${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data: LoginResponse = await res.json();
  saveToken(data.token);
  return data;
}

/**
 * ログアウト（トークンを削除）
 */
export function logout(): void {
  removeToken();
}

/**
 * 認証済みかどうかを確認
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * APIリクエスト用の認証ヘッダーを取得
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
