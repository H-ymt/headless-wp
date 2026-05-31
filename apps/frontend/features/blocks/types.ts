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
