import {
	C,
	Cards,
	CodeBlock,
	DocCard,
	H2,
	Icon,
	Lead,
	P,
	PropsTable,
} from "@dennation/typebook/react";
import type { DocsGo } from "../go.js";

export function PageCards({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				<C>Cards</C> lays out a two-column grid (one column on small screens) of{" "}
				<C>DocCard</C> navigation cards — icon, title, description, click
				handler.
			</Lead>

			<H2>Example</H2>
			<Cards>
				<DocCard
					icon={<Icon.zap size={20} />}
					title="Quick Start"
					desc="These two cards are live DocCards."
					onClick={() => go("quick-start")}
				/>
				<DocCard
					icon={<Icon.search size={20} />}
					title="Search"
					desc="Jump to the SearchPalette docs."
					onClick={() => go("search")}
				/>
			</Cards>

			<H2>Usage</H2>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Cards, DocCard, Icon } from "@dennation/typebook/react";

<Cards>
  <DocCard
    icon={<Icon.zap size={20} />}
    title="Quick Start"
    desc="From zero to a documented component."
    onClick={() => navigate("/docs/quick-start")}
  />
</Cards>`}
			/>

			<H2>DocCard props</H2>
			<PropsTable
				props={[
					{
						name: "title",
						type: "string",
						required: true,
						desc: "Card heading; a chevron is appended automatically.",
					},
					{
						name: "desc",
						type: "string",
						required: true,
						desc: "One-line description under the title.",
					},
					{
						name: "icon",
						type: "ReactNode",
						desc: "Accent-colored icon above the title.",
					},
					{
						name: "onClick",
						type: "() => void",
						desc: "Navigation handler. Cards render as buttons, so routing stays yours.",
					},
				]}
			/>
			<P>
				<C>Cards</C> itself takes only <C>children</C>.
			</P>
		</>
	);
}
