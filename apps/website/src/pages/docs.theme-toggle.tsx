import {
	A,
	C,
	CodeBlock,
	H2,
	Lead,
	P,
	PropsReference,
	Snippet,
	ThemeToggle,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { useDocsGo } from "../widgets/docs/useDocsGo";

function PageThemeToggle() {
	const go = useDocsGo();
	return (
		<>
			<Lead>
				<C>ThemeToggle</C> flips the document <C>data-theme</C> between light
				and dark and persists the choice to <C>localStorage</C>. It writes the
				attribute on the document root, so the whole page — including the design
				tokens in <C>theme.css</C> — swaps through the cascade.
			</Lead>

			<H2>Example</H2>
			<P>Click to toggle the theme of this page:</P>
			<Snippet name="theme-toggle-example">
				{() => (
					<ThemeToggle className="inline-flex items-center justify-center size-10 rounded-(--radius-token) border border-border text-fg-muted hover:text-fg hover:bg-bg-tertiary transition-colors" />
				)}
			</Snippet>

			<H2>Usage</H2>
			<P>
				The button renders a sun/moon icon for the current theme — style it
				through <C>className</C>. See{" "}
				<A onClick={() => go("theming")}>Theming</A> for the token system it
				drives.
			</P>
			<CodeBlock
				lang="tsx"
				code={`import { ThemeToggle } from "@dennation/typebook/react";

<ThemeToggle className="rounded-lg border border-border p-2" size={18} />`}
			/>

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
		</>
	);
}

export const Route = createFileRoute("/docs/theme-toggle")({
	component: PageThemeToggle,
});
