import DOMPurify from "isomorphic-dompurify";

/**
 * HTMLをサニタイズしてXSS攻撃を防ぐ
 * @param html サニタイズするHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "img",
      "figure",
      "figcaption",
      "div",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "alt",
      "src",
      "width",
      "height",
      "class",
      "id",
      "target",
      "rel",
    ],
    ALLOW_DATA_ATTR: false,
  });
}
