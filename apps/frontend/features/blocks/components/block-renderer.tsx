import Image from "next/image";
import { type Block, parseBlocksFromHTML } from "@/features/blocks/lib/blocks";
import { sanitizeHTML } from "@/lib/sanitize";

type BlockRendererProps = {
  html: string;
};

export function BlockRenderer({ html }: BlockRendererProps) {
  try {
    if (!html || typeof html !== "string") {
      return null;
    }

    const blocks = parseBlocksFromHTML(html);

    return (
      <>
        {blocks.map((block, index) => {
          if (typeof block === "string") {
            if (!block.trim()) {
              return null;
            }
            return (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(block) }}
                key={`html-${index}-${block.slice(0, 20)}`}
              />
            );
          }

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
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(html || "") }} />
    );
  }
}

type BlockComponentProps = {
  block: Block;
};

function ParagraphBlock({ block }: BlockComponentProps) {
  return (
    <p
      className="my-4 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.innerHTML ?? "") }}
    />
  );
}

function HeadingBlock({ block }: BlockComponentProps) {
  const level = (block.attributes.level as number) ?? 2;
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const sizeClass: Record<number, string> = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base",
  };
  return (
    <Tag
      className={`my-6 font-bold ${sizeClass[level] ?? "text-xl"}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.innerHTML ?? "") }}
    />
  );
}

function ImageBlock({ block }: BlockComponentProps) {
  const url = block.attributes.url as string | undefined;
  const alt = (block.attributes.alt as string) ?? "";
  const caption = block.attributes.caption as string | undefined;
  const width = (block.attributes.width as number) ?? 800;
  const height = (block.attributes.height as number) ?? 600;

  if (!url) {
    return null;
  }

  return (
    <figure className="my-6">
      <Image
        alt={alt}
        className="w-full rounded"
        height={height}
        src={url}
        width={width}
      />
      {caption && (
        <figcaption
          className="mt-2 text-center text-gray-500 text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(caption) }}
        />
      )}
    </figure>
  );
}

function ListBlock({ block }: BlockComponentProps) {
  const ordered = block.attributes.ordered as boolean | undefined;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`my-4 space-y-1 pl-6 ${ordered ? "list-decimal" : "list-disc"}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.innerHTML ?? "") }}
    />
  );
}

const BLOCK_COMPONENTS: Record<
  string,
  (props: BlockComponentProps) => React.ReactElement | null
> = {
  "core/paragraph": ParagraphBlock,
  "core/heading": HeadingBlock,
  "core/image": ImageBlock,
  "core/list": ListBlock,
};

function BlockComponent({ block }: BlockComponentProps) {
  const Component = BLOCK_COMPONENTS[block.name];
  if (!Component) {
    return null;
  }
  return <Component block={block} />;
}
