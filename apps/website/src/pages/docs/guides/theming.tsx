import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	MDTable,
	P,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageTheming() {
	return (
		<>
			<Lead>
				One OKLCH token system drives everything: the storybook UI, the docs kit
				and any consumer site. Tokens are CSS custom properties, so dark mode
				and live re-theming work through the cascade — no Tailwind <C>dark:</C>{" "}
				variants.
			</Lead>

			<H2>Design tokens</H2>
			<P>
				The single source of truth is <C>theme.css</C> inside the package. It
				defines the palette as variables and re-exports them into Tailwind
				utilities via <C>@theme inline</C> — so <C>bg-bg</C>,{" "}
				<C>text-fg-muted</C>, <C>border-border</C>, <C>text-accent</C> stay
				live.
			</P>
			<MDTable
				head={["Token group", "Examples", "Purpose"]}
				rows={[
					[
						"Knobs",
						<C key="v">--accent-h --accent-c --radius</C>,
						"Accent hue/chroma and base corner radius",
					],
					[
						"Backgrounds",
						<C key="v">--bg --bg-secondary --code-bg</C>,
						"Page, sections, cards, code blocks",
					],
					[
						"Text",
						<C key="v">--fg --fg-muted --fg-subtle</C>,
						"Three contrast levels",
					],
					[
						"Accent",
						<C key="v">--accent --accent-soft --ring</C>,
						"Buttons, links, highlights, focus ring",
					],
					[
						"Shadows",
						<C key="v">--shadow-sm --shadow-md --shadow-lg</C>,
						"Elevation; code highlighting uses Shiki's One theme",
					],
				]}
			/>

			<H2>Dark mode</H2>
			<P>
				A <C>[data-theme="dark"]</C> block overrides the same variable names.
				Toggling is one attribute on <C>{"<html>"}</C>; the package ships{" "}
				<C>{"<ThemeToggle/>"}</C> which also persists the choice in{" "}
				<C>localStorage</C> and respects the system preference.
			</P>
			<CodeBlock
				file="index.html"
				lang="tsx"
				code={`<script>
  // apply the saved theme before first paint to avoid a flash
  var t = localStorage.getItem("typebook-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", t);
</script>`}
			/>

			<H2>Using the tokens in your site</H2>
			<P>
				A consumer that renders its own pages (like this site) imports the
				shared tokens and lets Tailwind scan the package sources so the
				components' utilities are emitted:
			</P>
			<CodeBlock
				file="src/styles.css"
				icon={<Icon.palette size={14} />}
				lang="bash"
				code={`@import "tailwindcss";
@import "@dennation/typebook/src/react/shared/config/theme.css";

@source "./**/*.tsx";
@source "../node_modules/@dennation/typebook/src/react/**/*.tsx";`}
			/>

			<Callout type="info" title="Re-theming is two variables">
				Change <C>--accent-h</C> and <C>--accent-c</C> on <C>:root</C> and every
				accent-colored surface — buttons, links, the active sidebar item, search
				highlights — follows.
			</Callout>
			<DocsFooter
				prev={{ to: "/docs/getting-started/quick-start", title: "Quick Start" }}
				next={{ to: "/docs/storybook/story", title: "Story" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/theming")({
	component: PageTheming,
});
