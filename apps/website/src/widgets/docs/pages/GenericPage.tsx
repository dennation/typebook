import { Icon } from "@dennation/typebook/react";
import type { DocsPageMeta } from "../../../entities/docs/nav.js";
import { CodeBlock } from "../../../features/code-block/CodeBlock.js";
import {
	C,
	Callout,
	Cards,
	DocCard,
	H2,
	Lead,
	P,
} from "../../../shared/ui/md/index.js";
import type { DocsGo } from "../go.js";

/** Real-but-generic template for slugs without bespoke content. */
export function GenericPage({ meta, go }: { meta: DocsPageMeta; go: DocsGo }) {
	const title = meta.page.title;
	return (
		<>
			<Lead>
				Reference for <strong>{title}</strong>. This page is part of the{" "}
				{meta.page.section} section of the Typebok documentation.
			</Lead>
			<Callout type="info">
				This is a demo build. <strong>{title}</strong> is wired into the
				navigation, search and table of contents — the content here is
				illustrative.
			</Callout>
			<H2>Overview</H2>
			<P>
				Typebok exposes <C>{title}</C> as part of its public API. Like every
				other surface, it is fully typed and tree-shakeable.
			</P>
			<CodeBlock
				file="example.ts"
				icon={<Icon.ts size={14} />}
				lang="tsx"
				code={`import { ${title.replace(/[^a-zA-Z]/g, "") || "thing"} } from "typebok";

// usage depends on your setup — see the guides`}
			/>
			<H2>On this page</H2>
			<P>
				Use the sidebar to explore neighbouring topics, or press <C>⌘K</C> to
				jump anywhere in the docs.
			</P>
			<Cards>
				<DocCard
					icon={<Icon.book size={20} />}
					title="Introduction"
					desc="Start here."
					onClick={() => go("introduction")}
				/>
				<DocCard
					icon={<Icon.box size={20} />}
					title="Callout"
					desc="See the full component showcase."
					onClick={() => go("callout")}
				/>
			</Cards>
		</>
	);
}
