import {
	Button,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	Snippet,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageButton() {
	return (
		<>
			<Lead>
				<InlineCode>Button</InlineCode> is the package's call-to-action
				primitive — two variants (<InlineCode>primary</InlineCode>,{" "}
				<InlineCode>ghost</InlineCode>), three sizes, and a polymorphic{" "}
				<InlineCode>as="a"</InlineCode> escape hatch to render an anchor with
				the same styling.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Snippet name="button-variants">
				{() => (
					<div className="flex flex-wrap items-center gap-3">
						<Button size="sm">Small</Button>
						<Button size="md">Medium</Button>
						<Button size="lg">Large</Button>
						<Button variant="ghost">Ghost</Button>
					</div>
				)}
			</Snippet>

			<Heading level={2}>As an anchor</Heading>
			<Paragraph>
				Pass <InlineCode>as="a"</InlineCode> to render an{" "}
				<InlineCode>{"<a>"}</InlineCode> with the button styling — the props
				then accept anchor attributes such as <InlineCode>href</InlineCode>.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`<Button as="a" href="https://example.com" variant="ghost">
  Read the docs
</Button>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Composing the class</Heading>
			<Paragraph>
				When you need the button styling on an element you can't replace (a
				router <InlineCode>{"<Link>"}</InlineCode>, say),{" "}
				<InlineCode>buttonClass(variant, size, extra)</InlineCode> returns the
				class string directly. <InlineCode>ARROW_CLASS</InlineCode> is a helper
				for a trailing chevron that nudges right on hover.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="cta.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { ARROW_CLASS, buttonClass } from "@dennation/typebook/react";
import { ChevronRight } from "lucide-react";

<Link to="/docs" className={buttonClass("primary", "lg")}>
  Get started <ChevronRight className={ARROW_CLASS} />
</Link>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Props</Heading>
			<PropsReference
				props={[
					{
						name: "variant",
						type: '"primary" | "ghost"',
						default: '"primary"',
						desc: "Visual style of the button.",
					},
					{
						name: "size",
						type: '"sm" | "md" | "lg"',
						default: '"md"',
						desc: "Height, padding and font size.",
					},
					{
						name: "as",
						type: '"button" | "a"',
						default: '"button"',
						desc: 'Element to render. With "a" the props accept anchor attributes (href, target, …).',
					},
					{
						name: "children",
						type: "ReactNode",
						desc: "Button label / content.",
					},
					{
						name: "…rest",
						type: "ButtonHTMLAttributes | AnchorHTMLAttributes",
						desc: "All native attributes for the chosen element (onClick, disabled, href, …).",
					},
				]}
			/>
			<DocsFooter
				prev={{ to: "/docs/components/layout", title: "Layout" }}
				next={{ to: "/docs/components/theme-toggle", title: "ThemeToggle" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/button")({
	component: PageButton,
});
