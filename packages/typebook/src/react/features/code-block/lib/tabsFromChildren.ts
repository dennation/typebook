import { Children, isValidElement, type ReactNode } from "react";
import { CodeBlockTab, type CodeBlockTabProps } from "../ui/CodeBlockTab";

/** Internal, fully-resolved model of a single tab. */
export interface CodeTab {
	label: string;
	code: string;
	lang: string;
	file?: string;
	icon?: ReactNode;
	showLineNumbers?: boolean;
	highlightLines: number[];
}

/** Pull `<CodeBlock.Tab>` children into the internal tab model. */
export function tabsFromChildren(children: ReactNode): CodeTab[] {
	const tabs: CodeTab[] = [];
	Children.forEach(children, (child) => {
		if (!isValidElement(child) || child.type !== CodeBlockTab) return;
		const props = child.props as CodeBlockTabProps;
		const lang = props.lang ?? "tsx";
		tabs.push({
			label: props.label ?? props.file ?? lang,
			code: props.children ?? "",
			lang,
			file: props.file,
			icon: props.icon,
			showLineNumbers: props.showLineNumbers,
			highlightLines: props.highlightLines ?? [],
		});
	});
	return tabs;
}
