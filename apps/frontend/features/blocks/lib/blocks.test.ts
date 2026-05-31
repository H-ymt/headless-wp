import { describe, expect, it } from "vitest";
import { parseBlockComment, parseBlocksFromHTML } from "./blocks";

describe("parseBlockComment", () => {
  it("自己完結型ブロックを解析する", () => {
    const block = parseBlockComment(
      '<!-- wp:separator {"opacity":"dots"} /-->'
    );
    expect(block).not.toBeNull();
    expect(block?.name).toBe("separator");
    expect(block?.attributes).toEqual({ opacity: "dots" });
  });

  it("開始/終了タグ型ブロックを解析する", () => {
    const block = parseBlockComment(
      "<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->"
    );
    expect(block).not.toBeNull();
    expect(block?.name).toBe("paragraph");
    expect(block?.innerHTML).toBe("<p>Hello</p>");
  });

  it("属性なしのブロックを解析する", () => {
    const block = parseBlockComment(
      "<!-- wp:quote --><blockquote>text</blockquote><!-- /wp:quote -->"
    );
    expect(block).not.toBeNull();
    expect(block?.name).toBe("quote");
    expect(block?.attributes).toEqual({});
  });

  it("空文字を渡すと null を返す", () => {
    expect(parseBlockComment("")).toBeNull();
  });

  it("ブロックコメントでない文字列を渡すと null を返す", () => {
    expect(parseBlockComment("<p>plain html</p>")).toBeNull();
  });
});

describe("parseBlocksFromHTML", () => {
  it("複数ブロックを含む HTML を解析する", () => {
    const html = `<!-- wp:paragraph --><p>First</p><!-- /wp:paragraph -->
<!-- wp:paragraph --><p>Second</p><!-- /wp:paragraph -->`;
    const blocks = parseBlocksFromHTML(html);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ name: "paragraph" });
    expect(blocks[1]).toMatchObject({ name: "paragraph" });
  });

  it("ブロックコメントがない HTML はそのまま返す", () => {
    const html = "<p>No blocks here</p>";
    const blocks = parseBlocksFromHTML(html);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toBe(html);
  });

  it("空文字を渡すと空配列を返す", () => {
    expect(parseBlocksFromHTML("")).toEqual([]);
  });

  it("ブロックとプレーンテキストが混在する HTML を解析する", () => {
    const html =
      "<p>Before</p><!-- wp:paragraph --><p>Block</p><!-- /wp:paragraph --><p>After</p>";
    const blocks = parseBlocksFromHTML(html);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
  });

  it("1MB 超の HTML はブロック解析をスキップして文字列を返す", () => {
    const huge = "a".repeat(1_000_001);
    const blocks = parseBlocksFromHTML(huge);
    expect(blocks).toHaveLength(1);
    expect(typeof blocks[0]).toBe("string");
  });
});
