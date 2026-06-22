import {
	C,
	CopyCommand,
	getComponentMeta,
	Heading,
	Lead,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = getComponentMeta(CopyCommand);

function PageCopyCommand() {
	return (
		<>
			<Lead>
				<C>CopyCommand</C> is the copy-able install-command pill from the
				landing hero: a <C>$</C> prompt, the command in monospace, and a copy
				button with a brief confirmation state.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Snippet name="copy-command-example">
				{() => <CopyCommand cmd="pnpm add @dennation/typebook" />}
			</Snippet>

			<Heading level={2}>Props</Heading>
			<PropsReference props={propsToRows(meta.props)} />
			<DocsFooter
				prev={{ to: "/docs/components/navigation", title: "Navigation" }}
				next={{ to: "/docs/components/layout", title: "Layout" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/copy-command")({
	component: PageCopyCommand,
});
