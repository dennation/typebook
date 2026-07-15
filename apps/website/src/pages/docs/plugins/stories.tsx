import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PagePluginsStories() {
	return (
		<>
			<Lead>
				<InlineCode>defineStories</InlineCode> bakes a component and its scanned
				props into a <InlineCode>{"{ Story, Variants, Matrix }"}</InlineCode>{" "}
				namespace — ready-to-render views, no <InlineCode>of</InlineCode> to
				pass.
			</Lead>

			<Heading level={2}>Define</Heading>
			<Paragraph>
				Call <InlineCode>defineStories</InlineCode> with the component. The
				second argument holds <Strong>story-level settings</Strong> (your
				defaults); the component's prop metadata is injected at build time from
				the scan.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="button.stories.ts"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { defineStories } from "@dennation/typebook/react";
import { Button } from "../components/Button";

export const ButtonStories = defineStories(Button, {
  defaultProps: { children: "Click me" },
});`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Render</Heading>
			<Paragraph>
				Each view is a member of the namespace. The component is already bound,
				so you only describe how to show it.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="button.stories.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<ButtonStories.Story />
<ButtonStories.Variants axis="size" />
<ButtonStories.Matrix x="color" y={["variant"]} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				<InlineCode>Story</InlineCode> renders one preview,{" "}
				<InlineCode>Variants</InlineCode> a grid along one prop axis, and{" "}
				<InlineCode>Matrix</InlineCode> the cross-product of an{" "}
				<InlineCode>x</InlineCode> axis and one or more{" "}
				<InlineCode>y</InlineCode> axes. Axes are named by{" "}
				<Strong>prop name</Strong>, type-checked against the component — a typo
				is a compile error.
			</Paragraph>

			<Heading level={2}>Axis values</Heading>
			<Paragraph>
				By default an axis expands to <Strong>every value</Strong> of the prop's
				type (a literal union or boolean). Override with{" "}
				<InlineCode>values</InlineCode>, or generate them with{" "}
				<InlineCode>generate</InlineCode>.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="button.stories.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`{/* all values of the size union */}
<ButtonStories.Variants axis="size" />

{/* explicit subset */}
<ButtonStories.Variants axis="size" values={["sm", "lg"]} />

{/* generated */}
<ButtonStories.Variants axis="label" generate={() => randomWord()} count={3} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Callout type="info" title="defaultProps live here, not in the metadata">
				The scan carries only the component's <Strong>objective</Strong> types.
				How you want to present it — default props, wrappers — is a story
				concern, so it lives in <InlineCode>defineStories</InlineCode>'s config,
				right next to the views.
			</Callout>

			<Heading level={2}>Config</Heading>
			<PropsReference
				props={[
					{
						name: "defaultProps",
						type: "Partial<Props>",
						required: false,
						desc: "Default props applied to every view of this component.",
					},
				]}
			/>

			<Heading level={2}>View props</Heading>
			<PropsReference
				props={[
					{
						name: "axis",
						type: "keyof Props",
						required: true,
						desc: "Variants: the prop to vary along.",
					},
					{
						name: "values",
						type: "Props[axis][]",
						required: false,
						desc: "Variants: explicit values (default: every value of the prop's type).",
					},
					{
						name: "generate",
						type: "() => Props[axis]",
						required: false,
						desc: "Variants: generate values by calling it count times.",
					},
					{
						name: "x / y",
						type: "keyof Props / (keyof Props)[]",
						required: true,
						desc: "Matrix: the column axis and one or more row axes.",
					},
					{
						name: "props",
						type: "Partial<Props>",
						required: false,
						desc: "Per-render override merged over defaultProps.",
					},
					{
						name: "interactive",
						type: "boolean",
						required: false,
						desc: "Make each preview's props editable in place.",
					},
				]}
			/>

			<DocsFooter
				prev={{ to: "/docs/plugins/overview", title: "Overview" }}
				next={{
					to: "/docs/plugins/ai-instructions",
					title: "AI Instructions",
				}}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/plugins/stories")({
	component: PagePluginsStories,
});
