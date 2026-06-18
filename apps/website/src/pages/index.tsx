import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "../widgets/Landing";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return <Landing docsHref={`${import.meta.env.BASE_URL}docs/introduction`} />;
}
