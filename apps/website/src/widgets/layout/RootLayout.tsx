import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SearchPalette } from "../../features/docs-search/SearchPalette.js";
import { SiteHeader } from "../SiteHeader.js";
import { ShellContext, type ShellState } from "./ShellContext.js";

/** Root shell: the shared site header, ⌘K search palette and page outlet. */
export function RootLayout() {
	const navigate = useNavigate();
	const [searchOpen, setSearchOpen] = useState(false);
	const [docsMenuOpen, setDocsMenuOpen] = useState(false);

	// keyboard: cmd/ctrl+K or '/' opens search, Escape closes
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen((v) => !v);
			} else if (e.key === "Escape") {
				setSearchOpen(false);
			} else if (
				e.key === "/" &&
				!/input|textarea/i.test((e.target as HTMLElement | null)?.tagName ?? "")
			) {
				e.preventDefault();
				setSearchOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const shell = useMemo<ShellState>(
		() => ({
			openSearch: () => setSearchOpen(true),
			docsMenuOpen,
			setDocsMenuOpen,
		}),
		[docsMenuOpen],
	);

	const goFromSearch = (slug: string, heading?: string) => {
		void navigate({ to: "/docs/$slug", params: { slug }, hash: heading });
	};

	return (
		<ShellContext.Provider value={shell}>
			<SiteHeader />
			<Outlet />
			{searchOpen && (
				<SearchPalette
					onClose={() => setSearchOpen(false)}
					onNavigate={goFromSearch}
				/>
			)}
		</ShellContext.Provider>
	);
}
