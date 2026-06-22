import {
	C,
	Cards,
	DocCard,
	getComponentMeta,
	Heading,
	Lead,
	PropsReference,
	propsToRows,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Palette, Zap } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = getComponentMeta(DocCard);

function PageCards() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				<C>Cards</C> lays out a two-column grid (one column on small screens) of{" "}
				<C>DocCard</C> navigation cards — icon, title, description, click
				handler.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Snippet name="cards-example">
				{() => (
					<Cards>
						<DocCard
							icon={<Zap size={20} />}
							title="Quick Start"
							desc="From zero to a documented component."
							onClick={() =>
								navigate({ to: "/docs/getting-started/quick-start" })
							}
						/>
						<DocCard
							icon={<Palette size={20} />}
							title="Theming"
							desc="Jump to the theming guide."
							onClick={() => navigate({ to: "/docs/guides/theming" })}
						/>
					</Cards>
				)}
			</Snippet>

			<Heading level={2}>DocCard props</Heading>
			<PropsReference props={propsToRows(meta.props)} />
			<p>
				<C>Cards</C> itself takes only <C>children</C>.
			</p>
			<DocsFooter
				prev={{ to: "/docs/components/steps", title: "Steps" }}
				next={{ to: "/docs/components/accordion", title: "Accordion" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/cards")({
	component: PageCards,
});
