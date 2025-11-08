import { type Block, parseBlocksFromHTML } from "../lib/blocks";

type BlockRendererProps = {
  html: string;
};

/**
 * WordPress ブロックをレンダリングするコンポーネント
 */
export function BlockRenderer({ html }: BlockRendererProps) {
  try {
    if (!html || typeof html !== "string") {
      return null;
    }

    const blocks = parseBlocksFromHTML(html);

    // 開発環境でデバッグ情報を表示
    if (process.env.NODE_ENV === "development") {
      const blockCount = blocks.filter((b) => typeof b !== "string").length;
      if (blockCount > 0) {
        console.log(`[BlockRenderer] Found ${blockCount} block(s):`, blocks);
      }
    }

    return (
      <>
        {blocks.map((block, index) => {
          // 文字列の場合はそのままHTMLとして表示
          if (typeof block === "string") {
            // 空文字列の場合はスキップ
            if (!block.trim()) {
              return null;
            }
            return (
              <div
                dangerouslySetInnerHTML={{ __html: block }}
                key={`html-${index}-${block.slice(0, 20)}`}
              />
            );
          }

          // ブロックオブジェクトの場合は対応するコンポーネントをレンダリング
          return (
            <BlockComponent
              block={block}
              key={`block-${block.name}-${index}`}
            />
          );
        })}
      </>
    );
  } catch (error) {
    console.error("[BlockRenderer] Error rendering blocks:", error);
    // エラーが発生した場合は元のHTMLをそのまま表示
    return <div dangerouslySetInnerHTML={{ __html: html || "" }} />;
  }
}

type BlockComponentProps = {
  block: Block;
};

/**
 * 個別のブロックをレンダリング
 */
function BlockComponent({ block }: BlockComponentProps) {
  switch (block.name) {
    default:
      // 未対応のブロックは何も表示しない（またはデバッグ用に表示）
      if (process.env.NODE_ENV === "development") {
        return (
          <div className="my-4 rounded border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p>未対応のブロック: {block.name}</p>
            <pre className="mt-2 overflow-auto text-xs">
              {JSON.stringify(block.attributes, null, 2)}
            </pre>
          </div>
        );
      }
      return null;
  }
}

