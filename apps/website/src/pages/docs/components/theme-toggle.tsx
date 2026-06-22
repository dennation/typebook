import {
	C,
	CodeBlock,
	H2,
	Lead,
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
				<C>ThemeToggle</C> flips the document <C>data-theme</C> between light
				and dark and persists the choice to <C>localStorage</C>. It writes the
				attribute on the document root, so the whole page — including the design
				tokens in <C>theme.css</C> — swaps through the cascade.
			</Lead>

			<H2>Example</H2>
			<p>Click to toggle the theme of this page:</p>
			<Snippet name="theme-toggle-example">
				{() => (
					<ThemeToggle className="inline-flex items-center justify-center size-10 rounded-(--radius-token) border border-border text-fg-muted hover:text-fg hover:bg-bg-tertiary transition-colors" />
				)}
			</Snippet>

			<H2>Usage</H2>
			<p>
				The button renders a sun/moon icon for the current theme — style it
				through <C>className</C>. See{" "}
				<Link to="/docs/guides/theming">Theming</Link> for the token system it
				drives.
			</p>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`import { ThemeToggle } from "@dennation/typebook/react";

<ThemeToggle className="rounded-lg border border-border p-2" size={18} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H2>Props</H2>
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
