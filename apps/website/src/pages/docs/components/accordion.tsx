import {
	Accordion,
	defineStories,
	Heading,
	InlineCode,
	Lead,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = defineStories(Accordion);

function PageAccordion() {
	return (
		<>
			<Lead>
				<InlineCode>Accordion</InlineCode> is a single-open FAQ list: clicking a
				question expands its answer with an animated height transition and
				collapses the previously open one.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Snippet name="accordion-example">
				{() => (
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
										Yes, <InlineCode>a</InlineCode> is a{" "}
										<InlineCode>ReactNode</InlineCode> — code, links and lists
										all work.
									</>
								),
							},
						]}
					/>
				)}
			</Snippet>

			<Heading level={2}>Props</Heading>
			<PropsReference props={propsToRows(meta.props)} />
			<DocsFooter
				prev={{ to: "/docs/components/cards", title: "Cards" }}
				next={{ to: "/docs/components/tables", title: "Tables" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/accordion")({
	component: PageAccordion,
});
