import {
	C,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsTable,
} from "@dennation/typebook/react";

export function PageMatrix() {
	return (
		<>
			<Lead>
				<C>{"<Matrix>"}</C> renders the cross-product of two prop axes as a
				table: one axis across the columns (<C>x</C>), one or more axes stacked
				down the rows (<C>y</C>). Perfect for color × variant sweeps.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { allOf } from "@dennation/typebook";
import { Matrix } from "@dennation/typebook/react";

<Matrix
  of={button}
  x={allOf(button, "color")}
  y={[allOf(button, "variant"), allOf(button, "size")]}
/>`}
			/>
			<P>
				Each entry in <C>y</C> contributes its own block of rows, so two y-axes
				give you every combination of both against the x axis.
			</P>

			<H2>Props</H2>
			<PropsTable
				props={[
					{
						name: "of",
						type: "ComponentHandle",
						required: true,
						desc: (
							<>
								The handle returned by <C>register()</C>.
							</>
						),
					},
					{
						name: "x",
						type: "VariantConfig",
						required: true,
						desc: "The column axis.",
					},
					{
						name: "y",
						type: "VariantConfig[]",
						required: true,
						desc: "Row axes; each config produces a block of rows.",
					},
					{
						name: "props",
						type: "Partial<Props> & MissingProps",
						desc: "Base props applied to every cell.",
					},
					{
						name: "isolate",
						type: "boolean",
						desc: "Render each cell inside an iframe.",
					},
				]}
			/>
		</>
	);
}
