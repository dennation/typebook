import {
	C,
	Callout,
	Cards,
	DocCard,
	getComponentMeta,
	H2,
	Lead,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Box, Layers } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = getComponentMeta(Callout);

function PageCallout() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Callouts draw the reader's eye to information that doesn't belong in the
				body flow — notes, tips, warnings and dangers. An icon, an optional bold
				title, and a body; the intent sets the color and icon automatically.
			</Lead>

			<H2>Usage</H2>
			<Snippet name="callout-usage">
				{() => (
					<Callout type="warning" title="Heads up">
						This runs on the client only.
					</Callout>
				)}
			</Snippet>

			<H2>Intents</H2>
			<p>
				Four built-in intents map to semantic colors. Each picks a matching
				icon.
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<Callout type="info" title="info">
					Neutral context and cross-references.
				</Callout>
				<Callout type="success" title="success">
					Confirmations and best-practice tips.
				</Callout>
				<Callout type="warning" title="warning">
					Caveats and things that might bite.
				</Callout>
				<Callout type="danger" title="danger">
					Destructive or irreversible actions.
				</Callout>
			</div>

			<H2>Props</H2>
			<PropsReference props={propsToRows(meta.props)} />

			<H2>Notes</H2>
			<p>
				Intent colors are fixed OKLCH values blended with the theme through{" "}
				<C>color-mix()</C>, so callouts adapt to dark mode without extra
				variants. Inline code inside a callout switches to the page background
				for contrast.
			</p>

			<H2>Related</H2>
			<Cards>
				<DocCard
					icon={<Box size={20} />}
					title="CodeBlock"
					desc="Tabs, line highlights and copy."
					onClick={() => navigate({ to: "/docs/components/code-block" })}
				/>
				<DocCard
					icon={<Layers size={20} />}
					title="Tabs"
					desc="Switch between content panels."
					onClick={() => navigate({ to: "/docs/components/tabs" })}
				/>
			</Cards>
			<DocsFooter
				prev={{ to: "/docs/components/matrix", title: "Matrix" }}
				next={{ to: "/docs/components/code-block", title: "CodeBlock" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/callout")({
	component: PageCallout,
});
