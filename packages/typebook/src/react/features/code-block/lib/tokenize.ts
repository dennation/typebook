import type {
	BundledLanguage,
	Highlighter,
	SpecialLanguage,
	ThemedToken,
} from "shiki";

export type { ThemedToken };

/* Shiki with a CSS-variables theme: token colors come out as
   var(--shiki-token-*) references, which theme.css maps onto the design
   tokens (--syn-*) — so highlighting follows dark mode and the accent. */

const THEME_NAME = "typebook";
const PRELOADED_LANGS: BundledLanguage[] = ["tsx", "bash", "json"];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		// lazy: shiki and its grammars load only when a CodeBlock renders
		highlighterPromise = import("shiki").then((shiki) => {
			const theme = shiki.createCssVariablesTheme({
				name: THEME_NAME,
				variablePrefix: "--shiki-",
				fontStyle: true,
			});
			return shiki.createHighlighter({
				themes: [theme],
				langs: PRELOADED_LANGS,
			});
		});
	}
	return highlighterPromise;
}

/**
 * Tokenize code into per-line themed tokens. Unknown languages are loaded on
 * demand; if a grammar doesn't exist the code falls back to plain text.
 */
export async function tokenize(
	code: string,
	lang: string,
): Promise<ThemedToken[][]> {
	const highlighter = await getHighlighter();

	let resolved: BundledLanguage | SpecialLanguage = lang as BundledLanguage;
	if (!highlighter.getLoadedLanguages().includes(resolved)) {
		try {
			await highlighter.loadLanguage(resolved as BundledLanguage);
		} catch {
			resolved = "text";
		}
	}

	const { tokens } = highlighter.codeToTokens(code.replace(/\n+$/, ""), {
		lang: resolved,
		theme: THEME_NAME,
	});
	return tokens;
}
