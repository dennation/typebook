import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	MDTable,
	P,
} from "@dennation/typebook/react";

export function PageVariantHelpers() {
	return (
		<>
			<Lead>
				Three helpers describe a variant axis for <C>{"<Variants>"}</C> and{" "}
				<C>{"<Matrix>"}</C>. All take the <C>ComponentHandle</C> first, so the
				prop name and values are autocompleted and type-checked against the
				component.
			</Lead>

			<H2>allOf</H2>
			<P>
				Every value of a prop, derived from its TypeScript type — literal unions
				and booleans.
			</P>
			<CodeBlock
				lang="tsx"
				code={`allOf(button, "size")      // "sm" | "md" | "lg" → three variants
allOf(button, "disabled")  // boolean → two variants`}
			/>

			<H2>values</H2>
			<P>An explicit list when you want a subset or a specific order.</P>
			<CodeBlock lang="tsx" code={`values(button, "size", ["sm", "lg"])`} />

			<H2>generate</H2>
			<P>
				Programmatic variants: the function is called once per variant, its
				return type is constrained to the prop's type.
			</P>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`generate(button, "children", () => randomLabel(), 5)`}
			/>

			<H2>Summary</H2>
			<MDTable
				head={["Helper", "Signature", "Variants come from"]}
				rows={[
					[
						<C key="h">allOf</C>,
						<C key="s">allOf(of, prop)</C>,
						"The prop's TS type",
					],
					[
						<C key="h">values</C>,
						<C key="s">values(of, prop, vs)</C>,
						"Your explicit list",
					],
					[
						<C key="h">generate</C>,
						<C key="s">generate(of, prop, fn, count)</C>,
						"fn() called count times",
					],
				]}
			/>

			<Callout type="success" title="Resolved from the handle">
				<C>allOf</C> reads the union members from the handle's injected{" "}
				<C>props</C> at render time — when the component's type gains a value, the
				grid updates on the next build with no code change.
			</Callout>
		</>
	);
}
