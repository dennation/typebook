import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_DOCS_SLUG, isDocsSlug } from "../entities/docs/nav";
import { GITHUB_URL } from "../shared/lib/siteLinks";
import { DocsPage } from "../widgets/docs/DocsPage";

export const Route = createFileRoute("/docs/$slug")({
	beforeLoad: ({ params }) => {
		if (!isDocsSlug(params.slug)) {
			throw redirect({
				to: "/docs/$slug",
				params: { slug: DEFAULT_DOCS_SLUG },
			});
		}
	},
	component: DocsRoute,
});

function DocsRoute() {
	const { slug } = Route.useParams();
	return <DocsPage slug={slug} githubHref={GITHUB_URL} />;
}
