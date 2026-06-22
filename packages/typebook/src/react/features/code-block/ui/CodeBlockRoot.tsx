import { type ReactNode, useState } from "react";
import { tabsFromChildren } from "../lib/tabsFromChildren";
import { CodeView } from "./CodeView";
import { TabBar } from "./TabBar";

export interface CodeBlockRootProps {
	/** One or more `<CodeBlock.Tab>` elements. */
	children?: ReactNode;
}

/**
 * Docs code block — a tab bar over one or more highlighted, copyable snippets.
 * A single `<CodeBlock.Tab>` renders as a one-tab bar; there is no separate
 * "single snippet" mode, so the layout is always the same.
 */
export function CodeBlockRoot({ children }: CodeBlockRootProps) {
	const tabs = tabsFromChildren(children);
	const [active, setActive] = useState(0);

	if (tabs.length === 0) return null;

	const index = Math.min(active, tabs.length - 1);
	const current = tabs[index];

	return (
		<div className="border border-border rounded-(--radius-token) overflow-hidden bg-code-bg">
			<TabBar
				tabs={tabs}
				active={index}
				onSelect={setActive}
				code={current.code}
			/>
			<CodeView tab={current} />
		</div>
	);
}
CodeBlockRoot.displayName = "CodeBlock.Root";
