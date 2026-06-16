/**
 * Slice `[start, end)` but, when the slice begins at the first non-whitespace token of its line,
 * extend the start back to the line's indentation. This gives {@link dedent} a uniform block to
 * work on: without it an expression body like `() => (\n  <div/>\n)` would start mid-line with the
 * first line at column zero and the rest indented, defeating the common-indent calculation.
 */
export function sliceWithLeadingIndent(
	text: string,
	start: number,
	end: number,
): string {
	const lineStart = text.lastIndexOf("\n", start - 1) + 1;
	const from = text.slice(lineStart, start).trim() === "" ? lineStart : start;
	return text.slice(from, end);
}

/**
 * Remove surrounding blank lines and the common leading-whitespace shared by all
 * non-blank lines, so extracted source reads as if it were authored at column zero.
 * Shared by the oxc snippet scanner (inline functions) and the TypeScript client
 * (referenced components), so both forms dedent identically.
 */
export function dedent(source: string): string {
	const lines = source.replace(/\t/g, "  ").split("\n");

	while (lines.length > 0 && lines[0].trim() === "") lines.shift();
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
	if (lines.length === 0) return "";

	let min = Infinity;
	for (const line of lines) {
		if (line.trim() === "") continue;
		const indent = line.length - line.trimStart().length;
		if (indent < min) min = indent;
	}
	if (!Number.isFinite(min) || min === 0) return lines.join("\n");

	return lines.map((line) => line.slice(min)).join("\n");
}
