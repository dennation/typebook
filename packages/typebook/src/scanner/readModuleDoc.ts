import { readFile } from "node:fs/promises";
import ts from "typescript";
import type { ModuleInfo } from "../types";
import { trimLines } from "./jsdoc";

/**
 * The prose and `@example` bodies of a file's JSDoc block tagged `@module` — the only source of a
 * module's docs. Empty when the file has no such block; the first one wins if it has several.
 */
export async function readModuleDoc(
	file: string,
): Promise<Pick<ModuleInfo, "description" | "examples">> {
	const source = ts.createSourceFile(
		file,
		await readFile(file, "utf8"),
		ts.ScriptTarget.Latest,
	);
	// `jsDoc` is internal, but it is the only place holding *every* block above a node — the public
	// `getJSDocCommentsAndTags` returns just the last one, which is the component's own doc.
	const block = [...source.statements, source.endOfFileToken]
		.flatMap((node) => (node as { jsDoc?: ts.JSDoc[] }).jsDoc ?? [])
		.find((doc) => doc.tags?.some((tag) => tag.tagName.text === "module"));
	if (!block) return {};

	const description = text(block.comment);
	const examples = (block.tags ?? [])
		.filter((tag) => tag.tagName.text === "example")
		.map((tag) => text(tag.comment))
		.filter(Boolean);
	return {
		...(description && { description }),
		...(examples.length > 0 && { examples }),
	};
}

function text(comment: ts.JSDoc["comment"]): string {
	return trimLines(ts.getTextOfJSDocComment(comment) ?? "");
}
