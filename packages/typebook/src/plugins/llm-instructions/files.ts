import {
	mkdir,
	readdir,
	readFile,
	rm,
	rmdir,
	writeFile,
} from "node:fs/promises";
import path from "node:path";

/** The files a command produced: absolute path → content. */
export type FileMap = Map<string, string>;

/** How the directory differs from what the command produced. */
export interface FileDiff {
	/** Expected files that are missing or whose content differs. */
	stale: string[];
	/** Files present in the directory that the command didn't produce. */
	extra: string[];
}

/**
 * How `files` differs from what's in `dir` — **without writing anything**.
 *
 * Both directions matter. A missing or changed file means the output is behind the source; a file
 * nobody produced means it's ahead of it — a card for a component that no longer exists, which an
 * agent would happily read and believe. Only counting the first kind lets a deleted component leave
 * its documentation behind forever.
 */
export async function diffFiles(
	files: FileMap,
	dir: string,
): Promise<FileDiff> {
	const present = await listFiles(dir);
	// Listed under its exact name, not just readable: on a case-insensitive file system `button.md`
	// reads `Button.md`, which would pass a renamed card off as current.
	const listed = new Set(present);
	const stale = await Promise.all(
		[...files].map(async ([file, expected]) => {
			const actual = listed.has(file)
				? await readFile(file, "utf8").catch(() => null)
				: null;
			return actual === expected ? null : file;
		}),
	);
	return {
		stale: stale.filter((file) => file !== null).sort(),
		extra: present.filter((file) => !files.has(file)).sort(),
	};
}

/**
 * Make `dir` hold exactly `files`: write what changed, delete what no longer belongs.
 *
 * Deleting is safe because the directory belongs to this generator alone — a card's name may not
 * escape it, and nothing else should be writing there.
 *
 * Files whose content is already identical are left untouched. That matters beyond saving a write:
 * a dev server watches the tree it writes into, so rewriting an identical file would wake the
 * watcher, which regenerates, which rewrites… Parent directories are all created before the first
 * write, so an unwritable target fails the call before any card is written.
 *
 * Deletion comes **first**. On a case-insensitive file system (APFS, NTFS by default) `Button.md`
 * and `button.md` are one file: writing the new name overwrites the old one and keeps the old name,
 * so deleting the old name afterwards would delete the card just written. Removing it first — and
 * the directories it leaves empty, for a renamed folder — lets the write create the new name.
 */
export async function writeFiles(files: FileMap, dir: string): Promise<void> {
	const { stale, extra } = await diffFiles(files, dir);
	if (stale.length === 0 && extra.length === 0) return;

	await Promise.all(extra.map((file) => rm(file, { force: true })));
	await pruneEmptyDirs(dir);

	const targets = [...files].filter(([file]) => stale.includes(file));
	const dirs = new Set(targets.map(([file]) => path.dirname(file)));
	await Promise.all([...dirs].map((d) => mkdir(d, { recursive: true })));
	await Promise.all(
		targets.map(([file, content]) => writeFile(file, content, "utf8")),
	);
}

/** Every file under `dir`, absolute; empty when it doesn't exist yet. */
async function listFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, {
		recursive: true,
		withFileTypes: true,
	}).catch(() => []);
	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => path.join(entry.parentPath, entry.name));
}

/** Drop directories left empty by a deletion, deepest first. `dir` itself stays. */
async function pruneEmptyDirs(dir: string): Promise<void> {
	const entries = await readdir(dir, {
		recursive: true,
		withFileTypes: true,
	}).catch(() => []);
	const dirs = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => path.join(entry.parentPath, entry.name))
		.sort((a, b) => b.length - a.length);
	for (const candidate of dirs) await rmdir(candidate).catch(() => {});
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
