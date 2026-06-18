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
import { createFileRoute } from "@tanstack/react-router";
import { useDocsGo } from "../widgets/docs/useDocsGo";

const docCard = getComponentMeta(DocCard);

function PageCards() {
	const go = useDocsGo();
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
							onClick={() => go("quick-start")}
						/>
						<DocCard
							icon={<Icon.search size={20} />}
							title="Search"
							desc="Jump to the SearchPalette docs."
							onClick={() => go("search")}
						/>
					</Cards>
				)}
			</Snippet>

			<H2>DocCard props</H2>
			<PropsReference props={propsToRows(docCard.props)} />
			<P>
				<C>Cards</C> itself takes only <C>children</C>.
			</P>
		</>
	);
}

export const Route = createFileRoute("/docs/cards")({ component: PageCards });
