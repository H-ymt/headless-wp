"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/wordpress-common";
import { getToken, isAuthenticated, logout } from "@/features/auth/lib/auth";

export default function AuthButton() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async (token: string) => {
      try {
        const user = await getCurrentUser(token);
        if (user) {
          setUserName(user.name);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    const checkAuth = async () => {
      if (isAuthenticated()) {
        setAuthenticated(true);
        const token = getToken();
        if (token) {
          await fetchUserInfo(token);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUserName(null);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return null;
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-4">
        {userName && <span>{userName}</span>}
        <button
          className="border px-4 py-1 text-sm"
          onClick={handleLogout}
          type="button"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <a className="border px-4 py-1 text-sm" href="/login">
      ログイン
    </a>
  );
}
