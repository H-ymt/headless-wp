import Image from "next/image";
import { type Block, parseBlocksFromHTML } from "@/features/blocks/lib/blocks";
import { highlightCode } from "@/features/blocks/lib/shiki";
import { sanitizeHTML } from "@/lib/sanitize";

const PRE_CODE_OPEN_REGEX = /^<pre[^>]*><code[^>]*>/;
const PRE_CODE_CLOSE_REGEX = /<\/code><\/pre>$/;
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const SAFE_URL_REGEX = /^(https?:|mailto:|tel:|\/|#)/i;

function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) {
    return;
  }
  return SAFE_URL_REGEX.test(url.trim()) ? url : undefined;
}

type BlockRendererProps = {
  html: string;
};

export async function BlockRenderer({ html }: BlockRendererProps) {
  try {
    if (!html || typeof html !== "string") {
      return null;
    }

    const blocks = parseBlocksFromHTML(html);
    const rendered = await Promise.all(
      blocks.map((block, index) => {
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
        return renderBlock(block, index);
      })
    );

    return <>{rendered}</>;
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

function QuoteBlock({ block }: BlockComponentProps) {
  const citation = block.attributes.citation as string | undefined;
  return (
    <blockquote className="my-6 border-gray-300 border-l-4 pl-4 text-gray-700 italic">
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(block.innerHTML ?? ""),
        }}
      />
      {citation && (
        <cite
          className="mt-2 block text-gray-500 text-sm not-italic"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(citation) }}
        />
      )}
    </blockquote>
  );
}

async function CodeBlock({ block }: BlockComponentProps) {
  const lang = (block.attributes.language as string) || "text";
  const raw = block.innerHTML ?? "";
  const code = raw
    .replace(PRE_CODE_OPEN_REGEX, "")
    .replace(PRE_CODE_CLOSE_REGEX, "");
  const decoded = code
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  const highlighted = await highlightCode(decoded, lang);
  if (highlighted) {
    return (
      <div
        className="my-6 overflow-x-auto rounded text-sm [&_pre]:p-4"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }

  return (
    <pre className="my-6 overflow-x-auto rounded bg-gray-900 p-4 text-gray-100 text-sm">
      <code>{decoded}</code>
    </pre>
  );
}

function TableBlock({ block }: BlockComponentProps) {
  return (
    <div className="my-6 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(block.innerHTML ?? ""),
        }}
      />
    </div>
  );
}

function separatorClassName(opacity: string | undefined): string {
  if (opacity === "dots") {
    return "my-8 border-dotted border-t-2 border-gray-300";
  }
  if (opacity === "wide") {
    return "my-8 border-t border-gray-300 w-full";
  }
  return "my-8 border-t border-gray-300 mx-auto w-24";
}

function SeparatorBlock({ block }: BlockComponentProps) {
  const opacity = block.attributes.opacity as string | undefined;
  return <hr className={separatorClassName(opacity)} />;
}

function ButtonBlock({ block }: BlockComponentProps) {
  const safeUrl = sanitizeUrl(block.attributes.url as string | undefined);
  const text = block.attributes.text as string | undefined;
  const target = block.attributes.target as string | undefined;
  const rel =
    target === "_blank"
      ? "noopener noreferrer"
      : (block.attributes.rel as string | undefined);

  if (!safeUrl) {
    return null;
  }

  return (
    <div className="my-6">
      <a
        className="inline-block rounded bg-gray-900 px-6 py-3 text-sm text-white hover:bg-gray-700"
        href={safeUrl}
        rel={rel}
        target={target}
      >
        {text ?? safeUrl}
      </a>
    </div>
  );
}

function EmbedBlock({ block }: BlockComponentProps) {
  const safeUrl = sanitizeUrl(block.attributes.url as string | undefined);
  const caption = block.attributes.caption as string | undefined;

  if (!safeUrl) {
    return null;
  }

  const youtubeMatch = safeUrl.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <figure className="my-6">
        <div className="aspect-video w-full">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full rounded"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={caption ?? "YouTube video"}
          />
        </div>
        {caption && (
          <figcaption
            className="mt-2 text-center text-gray-500 text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(caption) }}
          />
        )}
      </figure>
    );
  }

  return (
    <div className="my-6">
      <a
        className="text-blue-600 underline hover:text-blue-800"
        href={safeUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {caption ?? safeUrl}
      </a>
    </div>
  );
}

function renderBlock(
  block: Block,
  index: number
): Promise<React.ReactElement | null> | React.ReactElement | null {
  switch (block.name) {
    case "core/paragraph":
      return (
        <ParagraphBlock block={block} key={`block-${block.name}-${index}`} />
      );
    case "core/heading":
      return (
        <HeadingBlock block={block} key={`block-${block.name}-${index}`} />
      );
    case "core/image":
      return <ImageBlock block={block} key={`block-${block.name}-${index}`} />;
    case "core/list":
      return <ListBlock block={block} key={`block-${block.name}-${index}`} />;
    case "core/quote":
      return <QuoteBlock block={block} key={`block-${block.name}-${index}`} />;
    case "core/code":
      return <CodeBlock block={block} key={`block-${block.name}-${index}`} />;
    case "core/table":
      return <TableBlock block={block} key={`block-${block.name}-${index}`} />;
    case "core/separator":
      return (
        <SeparatorBlock block={block} key={`block-${block.name}-${index}`} />
      );
    case "core/button":
      return <ButtonBlock block={block} key={`block-${block.name}-${index}`} />;
    case "core/embed":
      return <EmbedBlock block={block} key={`block-${block.name}-${index}`} />;
    default:
      return null;
  }
}
