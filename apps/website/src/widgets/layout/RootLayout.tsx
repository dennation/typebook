import { Outlet, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { SEARCH_INDEX } from "../../entities/docs/nav";
import { SearchPalette, useSearchHotkeys } from "../../features/search";
import { SiteHeader } from "../SiteHeader";
import { ShellContext, type ShellState } from "./ShellContext";

/** Root shell: the shared site header, ⌘K search palette and page outlet. */
export function RootLayout() {
	const navigate = useNavigate();
	const [searchOpen, setSearchOpen] = useState(false);
	const [docsMenuOpen, setDocsMenuOpen] = useState(false);

	useSearchHotkeys({
		toggle: useCallback(() => setSearchOpen((v) => !v), []),
		open: useCallback(() => setSearchOpen(true), []),
		close: useCallback(() => setSearchOpen(false), []),
	});

	const shell = useMemo<ShellState>(
		() => ({
			openSearch: () => setSearchOpen(true),
			docsMenuOpen,
			setDocsMenuOpen,
		}),
		[docsMenuOpen],
	);

	const goFromSearch = (slug: string, heading?: string) => {
		void navigate({ to: `/docs/${slug}` as "/docs", hash: heading });
	};

	return (
		<ShellContext.Provider value={shell}>
			<SiteHeader />
			<Outlet />
			{searchOpen && (
				<SearchPalette
					index={SEARCH_INDEX}
					onClose={() => setSearchOpen(false)}
					onNavigate={goFromSearch}
				/>
			)}
		</ShellContext.Provider>
	);
}
