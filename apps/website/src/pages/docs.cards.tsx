import {
	C,
	Cards,
	DocCard,
	getComponentMeta,
	H2,
	Icon,
	Lead,
	P,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DocsFooter } from "../widgets/docs/DocsFooter";

const docCard = getComponentMeta(DocCard);

function PageCards() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				<C>Cards</C> lays out a two-column grid (one column on small screens) of{" "}
				<C>DocCard</C> navigation cards — icon, title, description, click
				handler.
			</Lead>

			<H2>Example</H2>
			<Snippet name="cards-example">
				{() => (
					<Cards>
						<DocCard
							icon={<Icon.zap size={20} />}
							title="Quick Start"
							desc="From zero to a documented component."
							onClick={() => navigate({ to: "/docs/quick-start" })}
						/>
						<DocCard
							icon={<Icon.search size={20} />}
							title="Search"
							desc="Jump to the SearchPalette docs."
							onClick={() => navigate({ to: "/docs/search" })}
						/>
					</Cards>
				)}
			</Snippet>

			<H2>DocCard props</H2>
			<PropsReference props={propsToRows(docCard.props)} />
			<P>
				<C>Cards</C> itself takes only <C>children</C>.
			</P>
			<DocsFooter
				prev={{ to: "/docs/steps", title: "Steps" }}
				next={{ to: "/docs/accordion", title: "Accordion" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/cards")({ component: PageCards });
