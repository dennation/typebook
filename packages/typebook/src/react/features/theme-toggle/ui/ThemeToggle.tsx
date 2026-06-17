import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/constants";
import { Icon } from "../../../shared/ui/icon/index";

type Theme = "light" | "dark";

function readTheme(): Theme {
	if (typeof document === "undefined") return "light";
	return document.documentElement.getAttribute("data-theme") === "dark"
		? "dark"
		: "light";
}

export interface ThemeToggleProps {
	/** Class applied to the toggle button. */
	className?: string;
	/** Icon size in px. */
	size?: number;
}

/**
 * Toggles the document `data-theme` (light/dark) and persists the choice to
 * localStorage. Sets the attribute on the document root so the whole page —
 * including the design tokens in theme.css — swaps through the cascade.
 */
export function ThemeToggle({ className, size = 18 }: ThemeToggleProps) {
	const [theme, setTheme] = useState<Theme>(readTheme);

	// Keep state in sync if another instance (or the bootstrap script) changed it.
	useEffect(() => setTheme(readTheme()), []);

	const toggle = useCallback(() => {
		setTheme((prev) => {
			const next: Theme = prev === "dark" ? "light" : "dark";
			document.documentElement.setAttribute("data-theme", next);
			try {
				localStorage.setItem(THEME_STORAGE_KEY, next);
			} catch {
				// localStorage unavailable (e.g. sandboxed iframe)
			}
			return next;
		});
	}, []);

	return (
		<button
			type="button"
			className={className}
			onClick={toggle}
			aria-label="Toggle theme"
		>
			{theme === "dark" ? <Icon.sun size={size} /> : <Icon.moon size={size} />}
		</button>
	);
}
