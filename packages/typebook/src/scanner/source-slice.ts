/**
 * Pure source-text helpers shared by the two source slicers: the oxc {@link scanSnippets}
 * (inline `<Snippet>{fn}</Snippet>` children) and the TypeScript {@link TypeScriptClient.getSnippetSource}
 * (a `source={ref}` resolved across files). Both compute character offsets from their own AST,
 * then hand the raw text here so the shown source reads identically regardless of which path
 * produced it.
 */

/**
 * Remove surrounding blank lines and the common leading-whitespace shared by all non-blank lines,
 * so extracted source reads as if it were authored at column zero.
 *
 * The **first line is treated specially**: a sliced function body begins right after the opening
 * token (`() => (`, `=>`, `{`), so its own leading whitespace is not representative of the block —
 * and an upstream transform can even pull the opening element onto that line, leaving it at column
 * zero (e.g. TanStack Router's code-splitter rewriting `() => (\n  <div…` into `() => <div…`). We
 * therefore left-trim the first line and compute the common indent from the **remaining** lines
 * only — the standard behaviour of dedent/strip-indent implementations. This keeps the output
 * aligned no matter how the slice began, so no caller needs to pre-extend the slice.
 */
export function dedent(source: string): string {
	const lines = source.replace(/\t/g, "  ").split("\n");

	while (lines.length > 0 && lines[0].trim() === "") lines.shift();
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
	if (lines.length === 0) return "";

	// Common indent of every non-blank line *after the first*. The first line's indentation is
	// ambiguous — it began mid-slice — so it neither counts toward the minimum nor gets sliced;
	// it is simply left-trimmed.
	let min = Infinity;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === "") continue;
		const indent = lines[i].length - lines[i].trimStart().length;
		if (indent < min) min = indent;
	}

	const first = lines[0].trimStart();
	if (!Number.isFinite(min) || min === 0) {
		return [first, ...lines.slice(1)].join("\n");
	}
	return [first, ...lines.slice(1).map((line) => line.slice(min))].join("\n");
}
