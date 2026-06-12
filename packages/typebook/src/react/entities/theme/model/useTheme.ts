import { useCallback, useState, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/constants.js";

export type Theme = "light" | "dark";

const darkQuery = "(prefers-color-scheme: dark)";

function getSystemTheme(): Theme {
	return window.matchMedia(darkQuery).matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY);
		if (value === "light" || value === "dark") return value;
	} catch {
		// localStorage unavailable (e.g. iframe sandbox)
	}
	return null;
}

function subscribeToSystemTheme(callback: () => void): () => void {
	const mql = window.matchMedia(darkQuery);
	mql.addEventListener("change", callback);
	return () => mql.removeEventListener("change", callback);
}

export function useTheme(override?: Theme): {
	theme: Theme;
	toggleTheme: () => void;
} {
	const systemTheme = useSyncExternalStore(
		subscribeToSystemTheme,
		getSystemTheme,
		() => "light" as Theme,
	);

	const [userTheme, setUserTheme] = useState<Theme | null>(
		() => override ?? getStoredTheme(),
	);

	const theme = userTheme ?? systemTheme;

	const toggleTheme = useCallback(() => {
		setUserTheme((prev) => {
			const next = (prev ?? systemTheme) === "light" ? "dark" : "light";
			try {
				localStorage.setItem(THEME_STORAGE_KEY, next);
			} catch {
				// localStorage unavailable
			}
			return next;
		});
	}, [systemTheme]);

	return { theme, toggleTheme };
}
