import { Icon } from "@dennation/typebook/react";
import { CodeBlock } from "../../../features/code-block/CodeBlock.js";
import {
	Accordion,
	C,
	Callout,
	Cards,
	DocCard,
	H2,
	Lead,
	P,
	PropsTable,
	Step,
	Steps,
} from "../../../shared/ui/md/index.js";
import type { DocsGo } from "../go.js";

/** The showcase page: every docs component on one page. */
export function PageCallout({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				Callouts draw the reader's eye to information that doesn't belong in the
				body flow — notes, tips, warnings and dangers. They're the most-used MDX
				component in Typebok.
			</Lead>

			<Callout type="info" title="Anatomy">
				A callout is an icon, an optional bold title, and a body. Intent sets
				the color and icon automatically.
			</Callout>

			<H2>Usage</H2>
			<P>
				Import the component in any <C>.mdx</C> file, or use the shorthand
				blockquote syntax. Both compile to the same output.
			</P>
			<CodeBlock
				tabs={[
					{
						label: "MDX component",
						lang: "tsx",
						icon: <Icon.react size={13} />,
						code: `import { Callout } from "typebok/mdx";

<Callout type="warning" title="Heads up">
  This runs on the client only.
</Callout>`,
					},
					{
						label: "Shorthand",
						lang: "bash",
						icon: <Icon.doc size={13} />,
						code: `> [!WARNING] Heads up
> This runs on the client only.`,
					},
				]}
			/>

			<H2>Intents</H2>
			<P>
				Four built-in intents map to semantic colors. Each picks a matching
				icon.
			</P>
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<Callout type="info" title="info">
					Neutral context and cross-references.
				</Callout>
				<Callout type="success" title="success">
					Confirmations and best-practice tips.
				</Callout>
				<Callout type="warning" title="warning">
					Caveats and things that might bite.
				</Callout>
				<Callout type="danger" title="danger">
					Destructive or irreversible actions.
				</Callout>
			</div>

			<H2>Props</H2>
			<P>
				The <C>{"<Callout />"}</C> component accepts the following props.
			</P>
			<PropsTable
				props={[
					{
						name: "type",
						type: '"info" | "success" | "warning" | "danger"',
						default: '"info"',
						desc: "Visual intent. Controls the border, background tint and icon.",
					},
					{
						name: "title",
						type: "string",
						desc: "Optional bold heading rendered above the body.",
					},
					{
						name: "icon",
						type: "ReactNode",
						default: "auto",
						desc: (
							<>
								Override the default intent icon. Pass <C>null</C> to hide it
								entirely.
							</>
						),
					},
					{
						name: "children",
						type: "ReactNode",
						required: true,
						desc: "Body content. Accepts inline markdown and other components.",
					},
					{
						name: "collapsible",
						type: "boolean",
						default: "false",
						desc: "Render the callout as a toggle that expands on click.",
					},
				]}
			/>

			<H2>Customizing</H2>
			<P>
				Callout colors come from CSS variables, so theming is a one-liner.
				Override the intent token in your global stylesheet.
			</P>
			<CodeBlock
				file="globals.css"
				icon={<Icon.palette size={14} />}
				lang="tsx"
				highlightLines={[2]}
				code={`:root {
  --tb-callout-warning: oklch(0.7 0.16 60);
}`}
			/>

			<H2>Recipes</H2>
			<Steps>
				<Step title="Group related notes">
					<P>
						Stack callouts with a shared margin, but avoid more than two in a
						row — it dilutes their signal.
					</P>
				</Step>
				<Step title="Nest code inside">
					<P>Callouts can hold full code blocks for inline examples.</P>
					<CodeBlock lang="bash" code={`npx typebok build --strict`} />
				</Step>
			</Steps>

			<H2>FAQ</H2>
			<Accordion
				items={[
					{
						q: "Can I create a custom intent?",
						a: (
							<>
								Yes. Register a new key in <C>typebok.config.ts</C> under{" "}
								<C>callouts</C> with a color and icon, then use it as the{" "}
								<C>type</C> value.
							</>
						),
					},
					{
						q: "Do callouts work in plain Markdown?",
						a: (
							<>
								Yes — use the GitHub-style <C>{"> [!NOTE]"}</C> blockquote
								syntax and Typebok upgrades it to a styled callout at build
								time.
							</>
						),
					},
					{
						q: "Are they accessible?",
						a: "Callouts render with an appropriate ARIA role and the icon is decorative. Titles are real headings within the document outline.",
					},
				]}
			/>

			<Callout type="success" title="That's the full element set">
				This page alone uses headings, lists, a table, code blocks with tabs and
				copy, every callout intent, a props table, steps and an accordion — all
				default components.
			</Callout>

			<H2>Related</H2>
			<Cards>
				<DocCard
					icon={<Icon.box size={20} />}
					title="Code Block"
					desc="Tabs, line highlights and copy."
					onClick={() => go("code-block")}
				/>
				<DocCard
					icon={<Icon.layers size={20} />}
					title="Tabs"
					desc="Switch between content panels."
					onClick={() => go("tabs")}
				/>
			</Cards>
		</>
	);
}
