import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: IndexPage,
});

function IndexPage() {
	return (
		<div className="st:p-8">
			<h1 className="st:text-2xl st:font-bold">UI Studio Docs</h1>
			<p className="st:mt-2">
				Welcome to the docs. Pick a topic from the sidebar.
			</p>
		</div>
	);
}
