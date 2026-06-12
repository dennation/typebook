import {
	C,
	CodeBlock,
	H2,
	Icon,
	Lead,
	MDTable,
	P,
	PropsTable,
} from "@dennation/typebook/react";

export function PageTables() {
	return (
		<>
			<Lead>
				Two table components: <C>MDTable</C> for plain data (the equivalent of a
				markdown pipe table) and <C>PropsTable</C> for documenting a component
				API — every props list on this site is a <C>PropsTable</C>.
			</Lead>

			<H2>MDTable</H2>
			<MDTable
				head={["Bundler", "Entry", "Status"]}
				rows={[
					["Vite", <C key="e">@dennation/typebook/vite</C>, "Stable"],
					["webpack", <C key="e">@dennation/typebook/webpack</C>, "Stable"],
					["esbuild", <C key="e">@dennation/typebook/esbuild</C>, "Stable"],
				]}
			/>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { MDTable } from "@dennation/typebook/react";

<MDTable
  head={["Bundler", "Entry", "Status"]}
  rows={[["Vite", "@dennation/typebook/vite", "Stable"]]}
/>`}
			/>
			<PropsTable
				props={[
					{
						name: "head",
						type: "ReactNode[]",
						required: true,
						desc: "Header cells, left to right.",
					},
					{
						name: "rows",
						type: "ReactNode[][]",
						required: true,
						desc: "Body rows; each inner array is one row of cells.",
					},
				]}
			/>

			<H2>PropsTable</H2>
			<P>
				One striped row per prop with the name, type badge, required marker,
				default value and description:
			</P>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { PropsTable } from "@dennation/typebook/react";

<PropsTable
  props={[
    {
      name: "type",
      type: '"info" | "warning"',
      default: '"info"',
      desc: "Visual intent.",
    },
    { name: "children", type: "ReactNode", required: true, desc: "Body." },
  ]}
/>`}
			/>
			<PropsTable
				props={[
					{
						name: "props",
						type: "PropRowData[]",
						required: true,
						desc: (
							<>
								Rows to render:{" "}
								<C>{"{ name, type, required?, default?, desc }"}</C>, where{" "}
								<C>desc</C> is a <C>ReactNode</C>.
							</>
						),
					},
				]}
			/>
		</>
	);
}
