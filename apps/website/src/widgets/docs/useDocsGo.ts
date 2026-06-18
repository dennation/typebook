import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useShell } from "../layout/ShellContext";
import type { DocsGo } from "./go";

/**
 * In-docs navigation backed by the router. The data-driven nav (sidebar,
 * search, prev/next, cards) targets a runtime slug, so the `/docs/<slug>` path
 * is built dynamically — every slug resolves to a real file-based route.
 */
export function useDocsGo(): DocsGo {
	const navigate = useNavigate();
	const { setDocsMenuOpen } = useShell();
	return useCallback<DocsGo>(
		(slug, heading) => {
			setDocsMenuOpen(false);
			void navigate({ to: `/docs/${slug}` as "/docs", hash: heading });
		},
		[navigate, setDocsMenuOpen],
	);
}
