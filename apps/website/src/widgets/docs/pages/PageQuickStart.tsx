import { Icon } from "@dennation/typebook/react";
import { CodeBlock } from "../../../features/code-block/CodeBlock.js";
import {
	A,
	C,
	Callout,
	H2,
	Lead,
	MDTable,
	P,
} from "../../../shared/ui/md/index.js";
import type { DocsGo } from "../go.js";

export function PageQuickStart({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				Go from an empty folder to a navigable docs site. This assumes you ran{" "}
				<C>create-typebok</C> or finished the manual setup.
			</Lead>

			<H2>Project structure</H2>
			<P>
				Typebok is filesystem-driven. Folders become sidebar groups; files
				become pages. A <C>meta.json</C> controls order and labels.
			</P>
			<CodeBlock
				file="content/docs"
				icon={<Icon.box size={14} />}
				lang="bash"
				code={`content/docs
├── index.mdx          # /docs
├── meta.json          # group order + labels
├── getting-started
│   ├── index.mdx
│   └── installation.mdx
└── components
    ├── callout.mdx
    └── tabs.mdx`}
			/>

			<H2>Ordering pages</H2>
			<P>
				Drop a <C>meta.json</C> into any folder to set its title, icon and the
				order of its children.
			</P>
			<CodeBlock
				file="content/docs/meta.json"
				icon={<Icon.doc size={14} />}
				lang="json"
				code={`{
  "title": "Getting Started",
  "icon": "rocket",
  "pages": ["index", "installation", "quick-start"]
}`}
			/>

			<Callout type="success" title="Hot reload">
				Edits to content and <C>meta.json</C> reflect instantly in dev — no
				restart needed.
			</Callout>

			<H2>Add frontmatter</H2>
			<P>
				Every page supports a small set of frontmatter keys. Only <C>title</C>{" "}
				is required.
			</P>
			<MDTable
				head={["Key", "Type", "Description"]}
				rows={[
					[
						<C key="k">title</C>,
						<C key="t">string</C>,
						"Page heading and sidebar label",
					],
					[
						<C key="k">description</C>,
						<C key="t">string</C>,
						"Lead paragraph and meta description",
					],
					[
						<C key="k">icon</C>,
						<C key="t">string</C>,
						"Optional sidebar icon name",
					],
					[
						<C key="k">full</C>,
						<C key="t">boolean</C>,
						"Hide the TOC and use full width",
					],
				]}
			/>
			<P>
				Continue to <A onClick={() => go("markdown")}>Markdown & MDX</A> to see
				every block you can use inside a page.
			</P>
		</>
	);
}
