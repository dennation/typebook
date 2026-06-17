import {
	C,
	H2,
	Lead,
	MDTable,
	P,
	PropsReference,
	Snippet,
} from "@dennation/typebook/react";

export function PageTables() {
	return (
		<>
			<Lead>
				Two table components: <C>MDTable</C> for plain data (the equivalent of a
				markdown pipe table) and <C>PropsReference</C> for documenting a
				component API — every props list on this site is a <C>PropsReference</C>
				.
			</Lead>

			<H2>MDTable</H2>
			<Snippet name="mdtable-example">
				{() => (
					<MDTable
						head={["Bundler", "Entry", "Status"]}
						rows={[
							["Vite", <C key="e">@dennation/typebook/vite</C>, "Stable"],
							["webpack", <C key="e">@dennation/typebook/webpack</C>, "Stable"],
							["esbuild", <C key="e">@dennation/typebook/esbuild</C>, "Stable"],
						]}
					/>
				)}
			</Snippet>
			<PropsReference
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

			<H2>PropsReference</H2>
			<P>
				One striped row per prop with the name, type badge, required marker,
				default value and description:
			</P>
			<Snippet name="props-table-example">
				{() => (
					<PropsReference
						props={[
							{
								name: "type",
								type: '"info" | "warning"',
								default: '"info"',
								desc: "Visual intent.",
							},
							{
								name: "children",
								type: "ReactNode",
								required: true,
								desc: "Body.",
							},
						]}
					/>
				)}
			</Snippet>
			<PropsReference
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
