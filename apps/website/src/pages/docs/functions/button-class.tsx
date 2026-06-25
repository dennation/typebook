import {
	Cards,
	CodeBlock,
	DocCard,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
} from "@dennation/typebook/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MousePointerClick, Wand2 } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageButtonClass() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Composes the <InlineCode>Button</InlineCode> class string for use on a
				raw element — an <InlineCode>{"<a>"}</InlineCode>, a router link, or any
				node you want styled like a button without rendering one.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function buttonClass(\n  "),
					ref("variant", "#parameters"),
					txt("?: ButtonVariant,\n  "),
					ref("size", "#parameters"),
					txt("?: ButtonSize,\n  "),
					ref("extra", "#parameters"),
					txt("?: string,\n): "),
					ref("string", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "variant",
						type: '"primary" | "ghost"',
						required: false,
						default: '"primary"',
						desc: "Visual style of the button.",
					},
					{
						name: "size",
						type: '"sm" | "md" | "lg"',
						required: false,
						default: '"md"',
						desc: "Height and padding scale.",
					},
					{
						name: "extra",
						type: "string",
						required: false,
						desc: "Additional classes merged onto the result (e.g. layout or overrides).",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>string</InlineCode>: the full Tailwind class list for the
				given variant and size, with <InlineCode>extra</InlineCode> merged in —
				ready to drop onto any element's <InlineCode>className</InlineCode>.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">{`import { buttonClass } from "@dennation/typebook/react"
import { Link } from "@tanstack/react-router"

// style a router link like a primary button
<Link to="/docs" className={buttonClass("primary", "lg")}>
  Read the docs
</Link>`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Paragraph>
				Reach for <InlineCode>buttonClass</InlineCode> when you need the look on
				a non-button element. When you are rendering an actual control, use the{" "}
				<InlineCode>Button</InlineCode> component — it accepts the same{" "}
				<InlineCode>variant</InlineCode> / <InlineCode>size</InlineCode> and can
				render as an anchor via <InlineCode>as="a"</InlineCode>.
			</Paragraph>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<MousePointerClick size={20} />}
					title="Button"
					desc="The component these classes power."
					onClick={() => navigate({ to: "/docs/components/button" })}
				/>
				<DocCard
					icon={<Wand2 size={20} />}
					title="cx"
					desc="Join class names conditionally."
					onClick={() => navigate({ to: "/docs/functions/cx" })}
				/>
			</Cards>

			<DocsFooter prev={{ to: "/docs/functions/cx", title: "cx" }} />
		</>
	);
}

export const Route = createFileRoute("/docs/functions/button-class")({
	component: PageButtonClass,
});
