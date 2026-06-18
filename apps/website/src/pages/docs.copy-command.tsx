import {
	C,
	CopyCommand,
	getComponentMeta,
	H2,
	Lead,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../widgets/docs/DocsFooter";

const copyCommand = getComponentMeta(CopyCommand);

function PageCopyCommand() {
	return (
		<>
			<Lead>
				<C>CopyCommand</C> is the copy-able install-command pill from the
				landing hero: a <C>$</C> prompt, the command in monospace, and a copy
				button with a brief confirmation state.
			</Lead>

			<H2>Example</H2>
			<Snippet name="copy-command-example">
				{() => <CopyCommand cmd="pnpm add @dennation/typebook" />}
			</Snippet>

			<H2>Props</H2>
			<PropsReference props={propsToRows(copyCommand.props)} />
			<DocsFooter
				prev={{ to: "/docs/navigation", title: "Navigation" }}
				next={{ to: "/docs/layout", title: "Layout" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/copy-command")({
	component: PageCopyCommand,
});
