import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const postId = searchParams.get("id");

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!postId) {
    return new Response("Missing id parameter", { status: 400 });
  }

  const WP_API_URL =
    process.env.NEXT_PUBLIC_WP_API_URL ||
    `${process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8888"}/wp-json/wp/v2`;

  const res = await fetch(
    `${WP_API_URL}/posts/${postId}?status=draft&_embed=true`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WP_APPLICATION_PASSWORD}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return new Response("Post not found", { status: 404 });
  }

  const post = await res.json();
  const draft = await draftMode();
  draft.enable();

  redirect(`/posts/${post.slug}?preview=true`);
}
