export type Block = {
  name: string;
  attributes: Record<string, unknown>;
  innerHTML?: string;
};

export type ParagraphBlock = Block & {
  name: "core/paragraph";
};

export type HeadingBlock = Block & {
  name: "core/heading";
  attributes: {
    level?: number;
    textAlign?: string;
  };
};

export type ImageBlock = Block & {
  name: "core/image";
  attributes: {
    url?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
};

export type ListBlock = Block & {
  name: "core/list";
  attributes: {
    ordered?: boolean;
  };
};

export type ListItemBlock = Block & {
  name: "core/list-item";
};

export type QuoteBlock = Block & {
  name: "core/quote";
  attributes: {
    citation?: string;
  };
};

export type CodeBlock = Block & {
  name: "core/code";
  attributes: {
    language?: string;
  };
};

export type TableBlock = Block & {
  name: "core/table";
};

export type SeparatorBlock = Block & {
  name: "core/separator";
  attributes: {
    opacity?: string;
  };
};

export type ButtonBlock = Block & {
  name: "core/button";
  attributes: {
    url?: string;
    text?: string;
    target?: string;
    rel?: string;
  };
};

export type EmbedBlock = Block & {
  name: "core/embed";
  attributes: {
    url?: string;
    caption?: string;
    providerNameSlug?: string;
  };
};
