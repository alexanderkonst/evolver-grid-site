/**
 * Model text in the Console is markdown (`*italic*`, `**bold**`, `1. lists`). It is rendered, never shown
 * with its marks. Only text-shaped elements are allowed: raw HTML is skipped, links and images are
 * unwrapped to their text, so a model answer cannot inject anything into the page.
 */
import ReactMarkdown, { type Components } from "react-markdown";

const BLOCK_ALLOWED = ["p", "em", "strong", "code", "ul", "ol", "li", "br"];
const INLINE_ALLOWED = ["em", "strong", "code"];

const listSpacing = "my-2 space-y-1.5 pl-5";
const blockComponents: Components = {
  p: ({ node: _node, ...rest }) => <p className="my-0 [&:not(:first-child)]:mt-2" {...rest} />,
  ol: ({ node: _node, ...rest }) => <ol className={`${listSpacing} list-decimal`} {...rest} />,
  ul: ({ node: _node, ...rest }) => <ul className={`${listSpacing} list-disc`} {...rest} />,
  li: ({ node: _node, ...rest }) => <li className="pl-1" {...rest} />,
  strong: ({ node: _node, ...rest }) => <strong className="font-semibold" {...rest} />,
};
// Inline: the text sits inside a parent that is already a paragraph, list item or heading line.
const inlineComponents: Components = {
  p: ({ children }) => <>{children}</>,
  strong: ({ node: _node, ...rest }) => <strong className="font-semibold" {...rest} />,
};

/** A single newline inside a paragraph stays a line break (the old text was `whitespace-pre-wrap`). */
const keepLineBreaks = (text: string) => text.replace(/([^\n])\n(?=[^\n])/g, "$1  \n");

/**
 * A bold label glued to its text (`**Clear intent:**The goal`) is not bold in CommonMark: a closing `**`
 * after punctuation must be followed by a space or punctuation. Models write it that way, so the marks
 * leaked as literal asterisks. A space is added after a `**Label:**` that is missing one.
 */
const spaceAfterBoldLabel = (text: string) => text.replace(/(\*\*[^*\n]+[:：]\*\*)(?=[^\s\p{P}\p{S}])/gu, "$1 ");

type Props = { children: string; inline?: boolean };

const ConsoleMarkdown = ({ children, inline = false }: Props) => (
  <ReactMarkdown
    skipHtml
    allowedElements={inline ? INLINE_ALLOWED : BLOCK_ALLOWED}
    unwrapDisallowed
    components={inline ? inlineComponents : blockComponents}
  >
    {inline ? children : keepLineBreaks(spaceAfterBoldLabel(children))}
  </ReactMarkdown>
);

export default ConsoleMarkdown;
