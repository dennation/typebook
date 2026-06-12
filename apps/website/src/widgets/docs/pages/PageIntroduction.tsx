import {
	A,
	C,
	Callout,
	Cards,
	CodeBlock,
	DocCard,
	H2,
	Icon,
	Lead,
	P,
} from "@dennation/typebook/react";
import type { DocsGo } from "../go.js";

export function PageIntroduction({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				Typebok is a documentation framework for building fast, content-first
				docs sites. Author in Markdown or MDX, get a polished sidebar, full-text
				command palette, and themeable components out of the box.
			</Lead>
			<P>
				It pairs a file-based content layer with a small set of
				unstyled-but-beautiful React components. You bring the words; Typebok
				handles navigation, search indexing, syntax highlighting, and dark mode
				— without locking you into a rigid template.
			</P>

			<Callout type="info" title="Looking for the fast path?">
				Jump straight to <A onClick={() => go("installation")}>Installation</A>,
				or run <C>npx create-typebok@latest</C> to scaffold a starter in
				seconds.
			</Callout>

			<H2>Why Typebok</H2>
			<P>
				Most docs tooling forces a trade-off between authoring comfort and
				design control. Typebok keeps both: content stays plain Markdown, while
				every rendered block is a component you can restyle or replace.
			</P>
			<Cards>
				<DocCard
					icon={<Icon.zap size={20} />}
					title="Content-first"
					desc="Write .md or .mdx files in any folder structure. The sidebar mirrors your filesystem automatically."
					onClick={() => go("writing-content")}
				/>
				<DocCard
					icon={<Icon.search size={20} />}
					title="Search built in"
					desc="A pre-built command palette indexes headings and prose at build time — no external service."
					onClick={() => go("search-setup")}
				/>
				<DocCard
					icon={<Icon.palette size={20} />}
					title="Themeable"
					desc="Design tokens drive every color, radius and font. Override with a single CSS file."
					onClick={() => go("theming")}
				/>
				<DocCard
					icon={<Icon.layers size={20} />}
					title="MDX components"
					desc="Callouts, tabs, steps, props tables and cards ship ready to drop into any page."
					onClick={() => go("markdown")}
				/>
			</Cards>

			<H2>How it fits together</H2>
			<P>
				A Typebok site is three pieces: a content source, a config file, and the
				layout component. The source loader reads your files, the config wires
				up navigation and theme, and <C>{"<DocsLayout />"}</C> renders the
				shell.
			</P>
			<CodeBlock
				file="app/docs/layout.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				showLineNumbers
				highlightLines={[6]}
				code={`import { DocsLayout } from "typebok/layout";
import { source } from "@/lib/source";

export default function Layout({ children }) {
  return (
    <DocsLayout tree={source.pageTree} sidebar={{ collapsible: true }}>
      {children}
    </DocsLayout>
  );
}`}
			/>

			<Callout type="success" title="Zero-config defaults">
				Everything you see in these docs — this sidebar, the <C>⌘K</C> palette,
				the right-hand table of contents — is the default output. You can ship
				without writing a line of CSS.
			</Callout>

			<H2>Next steps</H2>
			<P>
				Ready to build? Start with installation, then wire up your first page.
			</P>
			<Cards>
				<DocCard
					icon={<Icon.rocket size={20} />}
					title="Installation"
					desc="Add Typebok to a new or existing app."
					onClick={() => go("installation")}
				/>
				<DocCard
					icon={<Icon.book size={20} />}
					title="Quick Start"
					desc="From empty folder to live docs page."
					onClick={() => go("quick-start")}
				/>
			</Cards>
		</>
	);
}
