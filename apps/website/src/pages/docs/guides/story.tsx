import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsReference,
} from "@dennation/typebook/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageStory() {
	return (
		<>
			<Lead>
				<C>{"<Story>"}</C> renders a single variant of a registered component
				inside a preview frame — the component with its <C>defaultProps</C>{" "}
				merged with whatever you pass via <C>props</C>.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Story } from "@dennation/typebook/react";

<Story of={button} />
<Story of={button} props={{ size: "lg", children: "Large" }} />`}
			/>

			<Callout type="info" title="Type-safe props">
				The <C>props</C> prop is phantom-typed: if the component has required
				props that <C>defaultProps</C> doesn't cover, TypeScript makes{" "}
				<C>props</C> mandatory and demands exactly the missing keys.
			</Callout>

			<H2>Props</H2>
			<PropsReference
				props={[
					{
						name: "of",
						type: "ComponentMeta",
						required: true,
						desc: (
							<>
								The handle returned by <C>getComponentMeta()</C>.
							</>
						),
					},
					{
						name: "props",
						type: "Partial<Props> & MissingProps",
						desc: (
							<>
								Per-story prop overrides; merged over <C>defaultProps</C>.
								Required when the registration leaves required props uncovered.
							</>
						),
					},
					{
						name: "isolate",
						type: "boolean",
						desc: "Render the preview inside an iframe to isolate styles and layout.",
					},
				]}
			/>

			<H2>Related</H2>
			<P>
				Need several values of one prop at once? Use{" "}
				<Link to="/docs/guides/variants">Variant grids</Link>. Two axes? Use{" "}
				<Link to="/docs/guides/matrix">Prop matrices</Link>.
			</P>
			<DocsFooter
				prev={{ to: "/docs/guides/theming", title: "Theming" }}
				next={{ to: "/docs/guides/variants", title: "Variant grids" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/story")({
	component: PageStory,
});
