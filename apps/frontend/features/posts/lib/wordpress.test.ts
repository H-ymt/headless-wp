import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPostBySlug, getPosts, getPostsWithPagination } from "./wordpress";

const mockPost = {
  id: 1,
  date: "2024-01-01T00:00:00",
  modified: "2024-01-02T00:00:00",
  slug: "hello-world",
  status: "publish",
  title: { rendered: "Hello World" },
  content: { rendered: "<p>Content</p>" },
  excerpt: { rendered: "<p>Excerpt</p>" },
  author: 1,
  featured_media: 0,
  categories: [1],
};

function makeFetch(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", makeFetch([mockPost]));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPosts", () => {
  it("200 のとき Post 配列を返す", async () => {
    const posts = await getPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("hello-world");
  });

  it("非 200 のとき Error をスローする", async () => {
    vi.stubGlobal("fetch", makeFetch("Server Error", 500));
    await expect(getPosts()).rejects.toThrow("Failed to fetch posts");
  });

  it("search パラメータを URL に含める", async () => {
    await getPosts({ search: "test" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("search=test");
  });

  it("categories パラメータを URL に含める", async () => {
    await getPosts({ categories: 5 });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("categories=5");
  });
});

describe("getPostBySlug", () => {
  it("スラッグが一致する投稿を返す", async () => {
    const post = await getPostBySlug("hello-world");
    expect(post?.slug).toBe("hello-world");
  });

  it("非 200 のとき null を返す", async () => {
    vi.stubGlobal("fetch", makeFetch([], 404));
    const post = await getPostBySlug("not-found");
    expect(post).toBeNull();
  });

  it("結果が空配列のとき null を返す", async () => {
    vi.stubGlobal("fetch", makeFetch([]));
    const post = await getPostBySlug("no-match");
    expect(post).toBeNull();
  });
});

describe("getPostsWithPagination", () => {
  it("X-WP-Total ヘッダーから total を読み取る", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([mockPost], 200, { "X-WP-Total": "42", "X-WP-TotalPages": "5" })
    );
    const result = await getPostsWithPagination();
    expect(result.total).toBe(42);
    expect(result.totalPages).toBe(5);
    expect(result.posts).toHaveLength(1);
  });

  it("search パラメータを URL に含める", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([mockPost], 200, { "X-WP-Total": "1", "X-WP-TotalPages": "1" })
    );
    await getPostsWithPagination({ search: "keyword" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("search=keyword");
  });
});
