import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** The files a command produced: absolute path → content. */
export type FileMap = Map<string, string>;

/**
 * Write a {@link FileMap}, skipping files whose content is already identical.
 *
 * Every parent directory is created before the first write, so an unwritable target fails the whole
 * call instead of leaving the output half-updated — which matters when the output is tracked source.
 * Skipping unchanged files matters too: a dev server watches the tree it writes into, so rewriting
 * an identical file would wake the watcher, which regenerates, which rewrites…
 */
export async function writeFiles(files: FileMap): Promise<void> {
	const stale = new Set(await staleFiles(files));
	if (stale.size === 0) return;

	const targets = [...files].filter(([file]) => stale.has(file));
	const dirs = new Set(targets.map(([file]) => path.dirname(file)));
	await Promise.all([...dirs].map((dir) => mkdir(dir, { recursive: true })));
	await Promise.all(
		targets.map(([file, content]) => writeFile(file, content, "utf8")),
	);
}

/**
 * The paths that are missing or differ from `files`, sorted — **without writing anything**.
 *
 * This is what makes generated files safe to commit: CI can prove they still match the source
 * instead of regenerating them into the working tree and hoping someone spots the diff.
 */
export async function staleFiles(files: FileMap): Promise<string[]> {
	const stale = await Promise.all(
		[...files].map(async ([file, expected]) => {
			const actual = await readFile(file, "utf8").catch(() => null);
			return actual === expected ? null : file;
		}),
	);
	return stale.filter((file) => file !== null).sort();
}

/**
 * One canonical form for every generated file: LF line endings and exactly one trailing newline.
 * Without it the same content can serialise differently per platform, which shows up as a spurious
 * diff and as a cache miss for any build orchestrator hashing the output. Trailing spaces *inside* a
 * line are left alone: in Markdown two of them are a line break.
 */
export function normalize(content: string): string {
	return `${content.replaceAll("\r\n", "\n").trimEnd()}\n`;
}
