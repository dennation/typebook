import { createContext, useContext } from "react";

/** UI state shared between the root layout's header and the pages below it. */
export interface ShellState {
	/** Open the global ⌘K search palette. */
	openSearch: () => void;
	/** Mobile docs sidebar drawer state (driven by the header's burger). */
	docsMenuOpen: boolean;
	setDocsMenuOpen: (open: boolean) => void;
}

export const ShellContext = createContext<ShellState>({
	openSearch: () => {},
	docsMenuOpen: false,
	setDocsMenuOpen: () => {},
});

export const useShell = () => useContext(ShellContext);
