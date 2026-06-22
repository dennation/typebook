import {
	Button,
	C,
	CodeBlock,
	Heading,
	Lead,
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
				<C>Button</C> is the package's call-to-action primitive — two variants (
				<C>primary</C>, <C>ghost</C>), three sizes, and a polymorphic{" "}
				<C>as="a"</C> escape hatch to render an anchor with the same styling.
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
			<p>
				Pass <C>as="a"</C> to render an <C>{"<a>"}</C> with the button styling —
				the props then accept anchor attributes such as <C>href</C>.
			</p>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`<Button as="a" href="https://example.com" variant="ghost">
  Read the docs
</Button>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Composing the class</Heading>
			<p>
				When you need the button styling on an element you can't replace (a
				router <C>{"<Link>"}</C>, say), <C>buttonClass(variant, size, extra)</C>{" "}
				returns the class string directly. <C>ARROW_CLASS</C> is a helper for a
				trailing chevron that nudges right on hover.
			</p>
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
