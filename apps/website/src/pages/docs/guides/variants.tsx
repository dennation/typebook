import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	PropsReference,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageVariants() {
	return (
		<>
			<Lead>
				<C>{"<Variants>"}</C> renders a labeled grid of component variants along
				one prop axis. The axis is described by a variant config —{" "}
				<C>allOf()</C>, <C>values()</C> or <C>generate()</C>.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				showLineNumbers
				code={`import { allOf, values } from "@dennation/typebook/react";
import { Variants } from "@dennation/typebook/react";

// every value of a literal-union prop, straight from its TS type
<Variants of={button} items={allOf(button, "size")} />

// or an explicit, typed list
<Variants of={button} items={values(button, "size", ["sm", "lg"])} columns={2} />`}
			/>

			<Callout type="success" title="Variants come from types">
				<C>allOf()</C> reads the prop's literal-union (or boolean) type from the
				handle's injected <C>props</C> — add a value to the union and the grid
				grows by itself.
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
						name: "items",
						type: "VariantConfig",
						required: true,
						desc: (
							<>
								The axis: <C>allOf(of, prop)</C>, <C>values(of, prop, vs)</C> or{" "}
								<C>generate(of, prop, fn, n)</C>.
							</>
						),
					},
					{
						name: "props",
						type: "Partial<Props> & MissingProps",
						desc: "Base props applied to every variant in the grid.",
					},
					{
						name: "columns",
						type: "number",
						desc: "Fixed column count; by default the grid adapts to the variant count.",
					},
					{
						name: "isolate",
						type: "boolean",
						desc: "Render each variant inside an iframe.",
					},
				]}
			/>
			<DocsFooter
				prev={{ to: "/docs/guides/story", title: "Rendering stories" }}
				next={{ to: "/docs/guides/matrix", title: "Prop matrices" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/variants")({
	component: PageVariants,
});
