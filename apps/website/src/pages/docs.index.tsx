import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_DOCS_SLUG } from "../entities/docs/nav.js";

export const Route = createFileRoute("/docs/")({
	beforeLoad: () => {
		throw redirect({ to: `/docs/${DEFAULT_DOCS_SLUG}` });
	},
});
