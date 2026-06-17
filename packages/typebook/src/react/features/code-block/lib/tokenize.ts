import type {
	BundledLanguage,
	Highlighter,
	SpecialLanguage,
	ThemedTokenWithVariants,
} from "shiki";

export type { ThemedTokenWithVariants };

/* Shiki with a bundled light/dark theme pair (One Light / One Dark Pro).
   We tokenize once with both themes (codeToTokensWithThemes); each token
   carries a `variants.light` / `variants.dark` color. CodeBlock renders both
   as CSS custom properties and theme.css picks the right one per
   [data-theme], so highlighting follows dark mode through the cascade. */

const LIGHT_THEME = "one-light";
const DARK_THEME = "one-dark-pro";
const PRELOADED_LANGS: BundledLanguage[] = ["tsx", "bash", "json"];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		// lazy: shiki and its grammars load only when a CodeBlock renders
		highlighterPromise = import("shiki").then((shiki) =>
			shiki.createHighlighter({
				themes: [LIGHT_THEME, DARK_THEME],
				langs: PRELOADED_LANGS,
			}),
		);
	}
	return highlighterPromise;
}

/**
 * Tokenize code into per-line themed tokens, each holding both the light and
 * dark color (via `variants`). Unknown languages are loaded on demand; if a
 * grammar doesn't exist the code falls back to plain text.
 */
export async function tokenize(
	code: string,
	lang: string,
): Promise<ThemedTokenWithVariants[][]> {
	const highlighter = await getHighlighter();

	let resolved: BundledLanguage | SpecialLanguage = lang as BundledLanguage;
	if (!highlighter.getLoadedLanguages().includes(resolved)) {
		try {
			await highlighter.loadLanguage(resolved as BundledLanguage);
		} catch {
			resolved = "text";
		}
	}

	return highlighter.codeToTokensWithThemes(code.replace(/\n+$/, ""), {
		lang: resolved,
		themes: { light: LIGHT_THEME, dark: DARK_THEME },
	});
}
