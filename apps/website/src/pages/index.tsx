import { createFileRoute } from "@tanstack/react-router";
import { GITHUB_URL } from "../shared/lib/siteLinks.js";
import { Landing } from "../widgets/Landing.js";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<Landing
			docsHref={`${import.meta.env.BASE_URL}docs/introduction`}
			githubHref={GITHUB_URL}
		/>
	);
}
