import { useEffect, useState } from "react";
import { type ThemedTokenWithVariants, tokenize } from "./tokenize";

/**
 * Tokenize `code` for `lang` with Shiki. Returns `null` until the (async)
 * highlighter resolves, so the caller can render plain lines meanwhile.
 */
export function useTokens(
	code: string,
	lang: string,
): ThemedTokenWithVariants[][] | null {
	const [tokens, setTokens] = useState<ThemedTokenWithVariants[][] | null>(
		null,
	);

	useEffect(() => {
		let cancelled = false;
		setTokens(null);
		tokenize(code, lang)
			.then((t) => {
				if (!cancelled) setTokens(t);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [code, lang]);

	return tokens;
}
