// サーバーサイドとクライアントサイドで異なる実装を使用
let DOMPurifyInstance: typeof import("isomorphic-dompurify").default | null =
  null;
let sanitizeHtmlInstance: typeof import("sanitize-html") | null = null;

/**
 * HTMLをサニタイズしてXSS攻撃を防ぐ
 * @param html サニタイズするHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // サーバーサイドでは sanitize-html を使用（jsdom の問題を回避）
  if (typeof window === "undefined") {
    if (!sanitizeHtmlInstance) {
      sanitizeHtmlInstance =
        require("sanitize-html") as typeof import("sanitize-html");
    }
    return sanitizeHtmlInstance(html, getSanitizeHtmlConfig());
  }

  // クライアントサイドでは isomorphic-dompurify を使用
  if (!DOMPurifyInstance) {
    DOMPurifyInstance = require("isomorphic-dompurify").default;
  }
  if (!DOMPurifyInstance) {
    throw new Error("DOMPurify instance could not be initialized");
  }
  return DOMPurifyInstance.sanitize(html, getDOMPurifyConfig());
}

/**
 * sanitize-html 用の設定を取得
 */
function getSanitizeHtmlConfig() {
  return {
    allowedTags: [
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
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "title"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
  };
}

/**
 * DOMPurify 用の設定を取得
 */
function getDOMPurifyConfig() {
  return {
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
  };
}
