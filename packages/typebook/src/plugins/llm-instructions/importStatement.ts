import type { ModuleInfo } from "../../types";
import type { MarkdownFormatOptions } from "./markdownFormat";

/** `import { A, B } from "…"` for all of a module's bindings, or `undefined` with no `importFrom`. */
export function importStatement(
	importFrom: MarkdownFormatOptions["importFrom"],
	module: ModuleInfo,
	root: string,
): string | undefined {
	const src =
		typeof importFrom === "function"
			? importFrom(module, { root })
			: importFrom;
	return src
		? `import { ${module.bindings.join(", ")} } from "${src}"`
		: undefined;
}
