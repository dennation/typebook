import { defineStories, Snippet } from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/Button";

const ButtonStories = defineStories(Button);

export const Route = createFileRoute("/button")({
	component: ButtonPage,
	staticData: { menu: { meta: { title: "Button", order: 2 } } },
});

function ButtonPage() {
	return (
		<div className="st:p-8 st:flex st:flex-col st:gap-8">
			<header>
				<h1 className="st:text-2xl st:font-bold">Button</h1>
				<p className="st:mt-2 st:text-text-muted">
					Stories driven by TypeScript types.
				</p>
			</header>

			<section>
				<h2 className="st:text-lg st:font-semibold st:mb-3">Default</h2>
				<ButtonStories.Story />
			</section>

			<section>
				<h2 className="st:text-lg st:font-semibold st:mb-3">All sizes</h2>
				<ButtonStories.Variants axis="size" />
			</section>

			<section>
				<h2 className="st:text-lg st:font-semibold st:mb-3">All variants</h2>
				<ButtonStories.Variants axis="variant" />
			</section>

			<section>
				<h2 className="st:text-lg st:font-semibold st:mb-3">
					Color × Variant matrix
				</h2>
				<ButtonStories.Matrix x="color" y={["variant"]} />
			</section>

			<section>
				<h2 className="st:text-lg st:font-semibold st:mb-3">
					Live example with source
				</h2>
				<Snippet name="button-group">
					{() => (
						<div className="st:flex st:gap-2">
							<Button size="sm">Small</Button>
							<Button size="md">Medium</Button>
							<Button size="lg">Large</Button>
						</div>
					)}
				</Snippet>
			</section>
		</div>
	);
}
