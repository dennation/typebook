import {
	Heading,
	InlineCode,
	Lead,
	MDTable,
	Paragraph,
	PropsReference,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageTables() {
	return (
		<>
			<Lead>
				Two table components: <InlineCode>MDTable</InlineCode> for plain data
				(the equivalent of a markdown pipe table) and{" "}
				<InlineCode>PropsReference</InlineCode> for documenting a component API
				— every props list on this site is a{" "}
				<InlineCode>PropsReference</InlineCode>.
			</Lead>

			<Heading level={2}>MDTable</Heading>
			<Snippet name="mdtable-example">
				{() => (
					<MDTable
						head={["Bundler", "Entry", "Status"]}
						rows={[
							[
								"Vite",
								<InlineCode key="e">@dennation/typebook/vite</InlineCode>,
								"Stable",
							],
							[
								"webpack",
								<InlineCode key="e">@dennation/typebook/webpack</InlineCode>,
								"Stable",
							],
							[
								"esbuild",
								<InlineCode key="e">@dennation/typebook/esbuild</InlineCode>,
								"Stable",
							],
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
			<Paragraph>
				One striped row per prop with the name, type badge, required marker,
				default value and description:
			</Paragraph>
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
								<InlineCode>
									{"{ name, type, required?, default?, desc }"}
								</InlineCode>
								, where <InlineCode>desc</InlineCode> is a{" "}
								<InlineCode>ReactNode</InlineCode>.
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
