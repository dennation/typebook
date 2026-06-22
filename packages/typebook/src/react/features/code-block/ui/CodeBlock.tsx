import { CodeBlockRoot } from "./CodeBlockRoot";
import { CodeBlockTab } from "./CodeBlockTab";

/**
 * Compound code block: `<CodeBlock.Root>` wraps one or more `<CodeBlock.Tab>`
 * children. Every code block is tabbed — a lone tab simply renders a one-tab bar.
 *
 * ```tsx
 * <CodeBlock.Root>
 *   <CodeBlock.Tab file="button.tsx" lang="tsx">{`<Button />`}</CodeBlock.Tab>
 * </CodeBlock.Root>
 * ```
 */
export const CodeBlock = {
	Root: CodeBlockRoot,
	Tab: CodeBlockTab,
};
