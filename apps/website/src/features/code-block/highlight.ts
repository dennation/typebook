/* Lightweight syntax highlighter (TS/TSX/JS, bash, json) for the docs.
   Produces HTML strings with `.tok-*` spans — the classes live in the
   shared theme layer. Good enough for docs display. */

const KEYWORDS = new Set(
	(
		"import from export default const let var function return if else for while " +
		"new await async type interface extends implements class enum public private readonly static " +
		"true false null undefined void as of in typeof instanceof throw try catch finally switch case break continue " +
		"this super yield delete"
	).split(" "),
);

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Tokenize a single line of TS/JS/TSX into HTML with token spans. */
function hlTsLine(line: string): string {
	let out = "";
	let i = 0;
	const n = line.length;
	const peek = (k: number) => line[i + k];
	while (i < n) {
		const c = line[i] as string;
		// comments
		if (c === "/" && peek(1) === "/") {
			out += `<span class="tok-com">${escapeHtml(line.slice(i))}</span>`;
			break;
		}
		// strings (incl template)
		if (c === '"' || c === "'" || c === "`") {
			let j = i + 1;
			while (j < n && line[j] !== c) {
				if (line[j] === "\\") j++;
				j++;
			}
			out += `<span class="tok-str">${escapeHtml(line.slice(i, j + 1))}</span>`;
			i = j + 1;
			continue;
		}
		// jsx / html tag name after < or </
		if (c === "<" && /[A-Za-z/]/.test(peek(1) || "")) {
			let j = i + 1;
			if (line[j] === "/") j++;
			const start = j;
			while (j < n && /[A-Za-z0-9.]/.test(line[j] as string)) j++;
			out += `<span class="tok-punc">${escapeHtml(line.slice(i, start))}</span>`;
			out += `<span class="tok-tag">${escapeHtml(line.slice(start, j))}</span>`;
			i = j;
			continue;
		}
		// numbers
		if (/[0-9]/.test(c) && !/[A-Za-z_$]/.test(line[i - 1] || "")) {
			let j = i;
			while (j < n && /[0-9a-fx._]/.test(line[j] as string)) j++;
			out += `<span class="tok-num">${escapeHtml(line.slice(i, j))}</span>`;
			i = j;
			continue;
		}
		// identifiers / keywords
		if (/[A-Za-z_$]/.test(c)) {
			let j = i;
			while (j < n && /[A-Za-z0-9_$]/.test(line[j] as string)) j++;
			const word = line.slice(i, j);
			const after = line.slice(j).match(/^\s*\(/);
			const beforeChar = line[i - 1];
			if (KEYWORDS.has(word)) out += `<span class="tok-kw">${word}</span>`;
			else if (after) out += `<span class="tok-fn">${word}</span>`;
			else if (beforeChar === ".")
				out += `<span class="tok-prop">${word}</span>`;
			else if (/^[A-Z]/.test(word))
				out += `<span class="tok-tag">${word}</span>`;
			else out += escapeHtml(word);
			i = j;
			continue;
		}
		// punctuation
		if (/[{}()[\];,.=:+\-*/%<>!&|?]/.test(c)) {
			out += `<span class="tok-punc">${escapeHtml(c)}</span>`;
			i++;
			continue;
		}
		out += escapeHtml(c);
		i++;
	}
	return out;
}

function hlBashLine(line: string): string {
	if (/^\s*#/.test(line))
		return `<span class="tok-com">${escapeHtml(line)}</span>`;
	let out = escapeHtml(line);
	// leading command word
	out = out.replace(
		/^(\s*)([a-z][\w-]*)/,
		(_m, sp: string, cmd: string) => `${sp}<span class="tok-fn">${cmd}</span>`,
	);
	// flags
	out = out.replace(
		/(\s)(--?[\w-]+)/g,
		(_m, sp: string, fl: string) => `${sp}<span class="tok-attr">${fl}</span>`,
	);
	return out;
}

function hlJsonLine(line: string): string {
	let out = escapeHtml(line);
	out = out.replace(
		/("(?:[^"\\]|\\.)*")(\s*:)/g,
		'<span class="tok-attr">$1</span>$2',
	);
	out = out.replace(
		/:(\s*)("(?:[^"\\]|\\.)*")/g,
		':$1<span class="tok-str">$2</span>',
	);
	out = out.replace(/\b(true|false|null)\b/g, '<span class="tok-kw">$1</span>');
	out = out.replace(
		/:(\s*)(-?\d+\.?\d*)/g,
		':$1<span class="tok-num">$2</span>',
	);
	return out;
}

export type HighlightLang = "tsx" | "bash" | "json";

/** Highlight a code string into an array of per-line HTML strings. */
export function highlight(code: string, lang: string): string[] {
	const fn =
		lang === "bash" ? hlBashLine : lang === "json" ? hlJsonLine : hlTsLine;
	return code.replace(/\n+$/, "").split("\n").map(fn);
}
