import { useEffect } from "react";

export interface SearchHotkeyActions {
	/** ⌘K / Ctrl+K. */
	toggle: () => void;
	/** `/` outside of inputs. */
	open: () => void;
	/** Escape. */
	close: () => void;
}

/** Global keyboard shortcuts for the search palette: ⌘K, `/`, Escape. */
export function useSearchHotkeys({ toggle, open, close }: SearchHotkeyActions) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				toggle();
			} else if (e.key === "Escape") {
				close();
			} else if (
				e.key === "/" &&
				!/input|textarea/i.test((e.target as HTMLElement | null)?.tagName ?? "")
			) {
				e.preventDefault();
				open();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [toggle, open, close]);
}
