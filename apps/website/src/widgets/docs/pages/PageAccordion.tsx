import {
	Accordion,
	C,
	H2,
	Lead,
	PropsTable,
	Snippet,
} from "@dennation/typebook/react";

export function PageAccordion() {
	return (
		<>
			<Lead>
				<C>Accordion</C> is a single-open FAQ list: clicking a question expands
				its answer with an animated height transition and collapses the
				previously open one.
			</Lead>

			<H2>Example</H2>
			<Snippet name="accordion-example">
				<Accordion
					items={[
						{
							q: "Is only one item open at a time?",
							a: "Yes — opening an item closes the previous one; clicking the open item closes it.",
						},
						{
							q: "Can answers hold rich content?",
							a: (
								<>
									Yes, <C>a</C> is a <C>ReactNode</C> — code, links and lists
									all work.
								</>
							),
						},
					]}
				/>
			</Snippet>

			<H2>Props</H2>
			<PropsTable
				props={[
					{
						name: "items",
						type: "AccordionItem[]",
						required: true,
						desc: (
							<>
								The questions and answers:{" "}
								<C>{"{ q: string, a: ReactNode }"}</C>. Questions double as
								keys, so keep them unique.
							</>
						),
					},
				]}
			/>
		</>
	);
}
