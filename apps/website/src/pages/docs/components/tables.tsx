import {
	C,
	Heading,
	Lead,
	MDTable,
	PropsReference,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageTables() {
	return (
		<>
			<Lead>
				Two table components: <C>MDTable</C> for plain data (the equivalent of a
				markdown pipe table) and <C>PropsReference</C> for documenting a
				component API — every props list on this site is a <C>PropsReference</C>
				.
			</Lead>

			<Heading level={2}>MDTable</Heading>
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

			<Heading level={2}>PropsReference</Heading>
			<p>
				One striped row per prop with the name, type badge, required marker,
				default value and description:
			</p>
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
			<DocsFooter
				prev={{ to: "/docs/components/accordion", title: "Accordion" }}
				next={{ to: "/docs/components/headings", title: "Headings" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/tables")({
	component: PageTables,
});
