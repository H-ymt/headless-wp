import type { Block } from "../types";

// 正規表現をトップレベルで定義（パフォーマンス向上）
const SELF_CLOSING_BLOCK_REGEX = /<!--\s*wp:([\w/-]+)(?:\s+({[^}]*}))?\s*\/-->/;
const OPENING_CLOSING_BLOCK_REGEX =
  /<!--\s*wp:([\w/-]+)(?:\s+({[^}]*}))?\s*-->([\s\S]*?)<!--\s*\/wp:\1\s*-->/;

/**
 * JSON属性をパースしてブロックオブジェクトを作成
 */
function createBlockFromMatch(
  name: string,
  attrsJson: string | undefined,
  innerHTML?: string
): Block | null {
  if (!name) {
    return null;
  }

  try {
    const attributes = attrsJson ? JSON.parse(attrsJson.trim()) : {};
    return {
      name,
      attributes,
      ...(innerHTML !== undefined && { innerHTML: innerHTML.trim() }),
    };
  } catch (error) {
    console.error(
      `[parseBlockComment] Failed to parse attributes for ${name}:`,
      error
    );
    return null;
  }
}

/**
 * 自己完結型ブロックを解析
 */
function parseSelfClosingBlock(comment: string): Block | null {
  const match = comment.match(SELF_CLOSING_BLOCK_REGEX);
  if (!match) {
    return null;
  }

  const [, name, attrsJson] = match;
  return createBlockFromMatch(name, attrsJson);
}

/**
 * 開始/終了タグ型ブロックを解析
 */
function parseOpeningClosingBlock(comment: string): Block | null {
  const match = comment.match(OPENING_CLOSING_BLOCK_REGEX);
  if (!match) {
    return null;
  }

  const [, name, attrsJson, innerHTML] = match;
  return createBlockFromMatch(name, attrsJson, innerHTML);
}

/**
 * WordPress のブロックコメントを解析してブロックオブジェクトに変換
 * 例: <!-- wp:paragraph -->content<!-- /wp:paragraph -->
 */
export function parseBlockComment(comment: string): Block | null {
  if (!comment || typeof comment !== "string") {
    return null;
  }

  try {
    // 自己完結型ブロックを試す
    const selfClosingBlock = parseSelfClosingBlock(comment);
    if (selfClosingBlock) {
      return selfClosingBlock;
    }

    // 開始/終了タグ型ブロックを試す
    const openingClosingBlock = parseOpeningClosingBlock(comment);
    if (openingClosingBlock) {
      return openingClosingBlock;
    }

    return null;
  } catch (error) {
    console.error("[parseBlockComment] Unexpected error:", error);
    return null;
  }
}

// ブロックコメントのパターン（自己完結型と開始/終了タグ型の両方に対応）
// 自己完結型: <!-- wp:name {...} /-->
// 開始/終了型: <!-- wp:name {...} -->...<!-- /wp:name -->
// シンプルなパターンで、パフォーマンスと安全性を優先
const BLOCK_COMMENT_REGEX =
  /<!--\s*wp:([\w/-]+)(?:\s+({[^}]*}))?\s*(?:\/)?-->(?:[\s\S]*?<!--\s*\/wp:\1\s*-->)?/g;

type BlockMatch = {
  index: number;
  length: number;
  content: string;
};

/**
 * HTML文字列からブロックコメントのマッチを収集
 */
function findBlockMatches(html: string): BlockMatch[] {
  const matches: BlockMatch[] = [];

  // 安全のため、HTMLが大きすぎる場合は処理をスキップ
  const MAX_HTML_LENGTH = 1_000_000; // 1MB
  if (html.length > MAX_HTML_LENGTH) {
    console.warn(
      `[findBlockMatches] HTML too large (${html.length} chars), skipping block parsing`
    );
    return matches;
  }

  try {
    const MAX_ITERATIONS = 1000; // 無限ループ防止
    let iterationCount = 0;

    // matchAllを使用してより安全にマッチを検索
    const allMatches = html.matchAll(BLOCK_COMMENT_REGEX);

    for (const match of allMatches) {
      if (iterationCount >= MAX_ITERATIONS) {
        console.warn(
          "[findBlockMatches] Too many iterations, stopping block parsing"
        );
        break;
      }

      matches.push({
        index: match.index ?? 0,
        length: match[0].length,
        content: match[0],
      });
      iterationCount += 1;
    }
  } catch (error) {
    console.error("[findBlockMatches] Error finding blocks:", error);
  }

  return matches;
}

/**
 * ブロックマッチを処理してブロック配列に変換
 */
function processBlockMatches(
  html: string,
  matches: BlockMatch[]
): Array<Block | string> {
  const blocks: Array<Block | string> = [];
  let currentIndex = 0;

  for (const blockMatch of matches) {
    // ブロックの前のテキストを追加
    if (blockMatch.index > currentIndex) {
      const textBefore = html.slice(currentIndex, blockMatch.index).trim();
      if (textBefore) {
        blocks.push(textBefore);
      }
    }

    // ブロックを解析
    const block = parseBlockComment(blockMatch.content);
    if (block) {
      blocks.push(block);
    } else {
      // 解析に失敗した場合は元のHTMLをそのまま追加
      blocks.push(blockMatch.content);
    }

    currentIndex = blockMatch.index + blockMatch.length;
  }

  // 残りのテキストを追加
  if (currentIndex < html.length) {
    const remainingText = html.slice(currentIndex).trim();
    if (remainingText) {
      blocks.push(remainingText);
    }
  }

  return blocks;
}

/**
 * HTML文字列からブロックコメントを抽出して解析
 */
export function parseBlocksFromHTML(html: string): Array<Block | string> {
  try {
    // HTMLが空の場合は空配列を返す
    if (!html || typeof html !== "string") {
      return [];
    }

    const matches = findBlockMatches(html);

    // マッチが見つからない場合はHTML全体を返す
    if (matches.length === 0) {
      return html.trim() ? [html] : [];
    }

    const blocks = processBlockMatches(html, matches);
    return blocks.length > 0 ? blocks : [html];
  } catch (error) {
    // エラーが発生した場合は元のHTMLをそのまま返す
    console.error("[parseBlocksFromHTML] Error parsing blocks:", error);
    return html.trim() ? [html] : [];
  }
}

/**
 * ブロックコメントを削除してHTMLをクリーンアップ（後方互換性のため）
 */
export function cleanWordPressHTML(html: string): string {
  return html.replace(/<!--\s*wp:[\s\S]*?-->/g, "").trim();
}

