import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	MDTable,
	Paragraph,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageTheming() {
	return (
		<>
			<Lead>
				One OKLCH token system drives everything: the storybook UI, the docs kit
				and any consumer site. Tokens are CSS custom properties, so dark mode
				and live re-theming work through the cascade — no Tailwind{" "}
				<InlineCode>dark:</InlineCode> variants.
			</Lead>

			<Heading level={2}>Design tokens</Heading>
			<Paragraph>
				The single source of truth is <InlineCode>theme.css</InlineCode> inside
				the package. It defines the palette as variables and re-exports them
				into Tailwind utilities via <InlineCode>@theme inline</InlineCode> — so{" "}
				<InlineCode>bg-bg</InlineCode>, <InlineCode>text-fg-muted</InlineCode>,{" "}
				<InlineCode>border-border</InlineCode>,{" "}
				<InlineCode>text-accent</InlineCode> stay live.
			</Paragraph>
			<MDTable
				head={["Token group", "Examples", "Purpose"]}
				rows={[
					[
						"Knobs",
						<InlineCode key="v">--accent-h --accent-c --radius</InlineCode>,
						"Accent hue/chroma and base corner radius",
					],
					[
						"Backgrounds",
						<InlineCode key="v">--bg --bg-secondary --code-bg</InlineCode>,
						"Page, sections, cards, code blocks",
					],
					[
						"Text",
						<InlineCode key="v">--fg --fg-muted --fg-subtle</InlineCode>,
						"Three contrast levels",
					],
					[
						"Accent",
						<InlineCode key="v">--accent --accent-soft --ring</InlineCode>,
						"Buttons, links, highlights, focus ring",
					],
					[
						"Shadows",
						<InlineCode key="v">
							--shadow-sm --shadow-md --shadow-lg
						</InlineCode>,
						"Elevation; code highlighting uses Shiki's One theme",
					],
				]}
			/>

			<Heading level={2}>Dark mode</Heading>
			<Paragraph>
				A <InlineCode>[data-theme="dark"]</InlineCode> block overrides the same
				variable names. Toggling is one attribute on{" "}
				<InlineCode>{"<html>"}</InlineCode>; the package ships{" "}
				<InlineCode>{"<ThemeToggle/>"}</InlineCode> which also persists the
				choice in <InlineCode>localStorage</InlineCode> and respects the system
				preference.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab file="index.html" lang="tsx">
					{`<script>
  // apply the saved theme before first paint to avoid a flash
  var t = localStorage.getItem("typebook-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", t);
</script>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Using the tokens in your site</Heading>
			<Paragraph>
				A consumer that renders its own pages (like this site) imports the
				shared tokens and lets Tailwind scan the package sources so the
				components' utilities are emitted:
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/styles.css"
					icon={<Palette size={14} />}
					lang="bash"
				>
					{`@import "tailwindcss";
@import "@dennation/typebook/src/react/shared/config/theme.css";

@source "./**/*.tsx";
@source "../node_modules/@dennation/typebook/src/react/**/*.tsx";`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Callout type="info" title="Re-theming is two variables">
				Change <InlineCode>--accent-h</InlineCode> and{" "}
				<InlineCode>--accent-c</InlineCode> on <InlineCode>:root</InlineCode>{" "}
				and every accent-colored surface — buttons, links, the active sidebar
				item, search highlights — follows.
			</Callout>
			<DocsFooter
				prev={{ to: "/docs/getting-started/quick-start", title: "Quick Start" }}
				next={{ to: "/docs/guides/story", title: "Rendering stories" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/theming")({
	component: PageTheming,
});
