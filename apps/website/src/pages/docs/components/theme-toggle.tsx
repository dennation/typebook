import {
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	Snippet,
	ThemeToggle,
} from "@dennation/typebook/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageThemeToggle() {
	return (
		<>
			<Lead>
				<InlineCode>ThemeToggle</InlineCode> flips the document{" "}
				<InlineCode>data-theme</InlineCode> between light and dark and persists
				the choice to <InlineCode>localStorage</InlineCode>. It writes the
				attribute on the document root, so the whole page — including the design
				tokens in <InlineCode>theme.css</InlineCode> — swaps through the
				cascade.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Paragraph>Click to toggle the theme of this page:</Paragraph>
			<Snippet name="theme-toggle-example">
				{() => (
					<ThemeToggle className="inline-flex items-center justify-center size-10 rounded-(--radius-token) border border-border text-fg-muted hover:text-fg hover:bg-bg-tertiary transition-colors" />
				)}
			</Snippet>

			<Heading level={2}>Usage</Heading>
			<Paragraph>
				The button renders a sun/moon icon for the current theme — style it
				through <InlineCode>className</InlineCode>. See{" "}
				<Link to="/docs/guides/theming">Theming</Link> for the token system it
				drives.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`import { ThemeToggle } from "@dennation/typebook/react";

<ThemeToggle className="rounded-lg border border-border p-2" size={18} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Props</Heading>
			<PropsReference
				props={[
					{
						name: "className",
						type: "string",
						desc: "Class applied to the toggle button.",
					},
					{
						name: "size",
						type: "number",
						default: "18",
						desc: "Icon size in px.",
					},
				]}
			/>
			<DocsFooter
				prev={{ to: "/docs/components/button", title: "Button" }}
				next={{ to: "/docs/components/error-boundary", title: "ErrorBoundary" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/theme-toggle")({
	component: PageThemeToggle,
});
