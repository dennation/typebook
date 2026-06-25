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
import { MousePointerClick, Palette } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageCx() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Joins class names into a single string, dropping anything falsy. A tiny
				conditional-className helper — no object syntax, no dependencies — for
				composing Tailwind classes inline.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function cx(\n  ..."),
					ref("parts", "#parameters"),
					txt(": Array<string | false | null | undefined>,\n): "),
					ref("string", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "parts",
						type: "Array<string | false | null | undefined>",
						required: true,
						desc: "Class-name fragments. Falsy entries (false / null / undefined) are skipped, so short-circuit conditionals work inline.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>string</InlineCode>: the truthy fragments joined with
				single spaces.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">{`cx("btn", isActive && "btn-active", disabled && "opacity-50")
// isActive=true, disabled=false → "btn btn-active"`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Paragraph>
				<InlineCode>cx</InlineCode> does no de-duplication or Tailwind merge —
				it is a plain join. For conflicting utilities, order them so the
				intended one wins, or compose with{" "}
				<InlineCode>tailwind-variants</InlineCode>.
			</Paragraph>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<Palette size={20} />}
					title="buttonClass"
					desc="The Button's class string for raw elements."
					onClick={() => navigate({ to: "/docs/functions/button-class" })}
				/>
				<DocCard
					icon={<MousePointerClick size={20} />}
					title="Button"
					desc="The CTA primitive built on these classes."
					onClick={() => navigate({ to: "/docs/components/button" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/functions/child-text", title: "childText" }}
				next={{ to: "/docs/functions/button-class", title: "buttonClass" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/cx")({
	component: PageCx,
});
