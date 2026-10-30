import { mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { describe, expect, test } from "vitest";
import { diffFiles, writeFiles } from "../llm-instructions/files";

/** A fresh output directory holding `files` (relative path → content). */
async function outDir(files: Record<string, string>): Promise<string> {
	const dir = await mkdtemp(nodePath.join(tmpdir(), "typebook-"));
	for (const [name, content] of Object.entries(files)) {
		await mkdir(nodePath.dirname(nodePath.join(dir, name)), {
			recursive: true,
		});
		await writeFile(nodePath.join(dir, name), content);
	}
	return dir;
}

const list = (dir: string) => readdir(dir, { recursive: true });

// On a case-insensitive file system (APFS and NTFS by default) `Button.md` and `button.md` are one
// file: writing the new name overwrites the old one in place, keeping the old name, so deleting the
// old name afterwards deleted the card just written.
describe("writeFiles: a name that changes only in case", () => {
	test("is written under the new name, with the new content", async () => {
		const dir = await outDir({ "Button.md": "old\n" });
		const files = new Map([[nodePath.join(dir, "button.md"), "new\n"]]);

		await writeFiles(files, dir);

		expect(await list(dir)).toEqual(["button.md"]);
		expect(await readFile(nodePath.join(dir, "button.md"), "utf8")).toBe(
			"new\n",
		);
		// …so `check` passes after a single `generate`.
		expect(await diffFiles(files, dir)).toEqual({ stale: [], extra: [] });
	});

	// Content alone can't tell the two apart: read through the old name, the new one looks current.
	test("is renamed even when the content is the same", async () => {
		const dir = await outDir({ "Button.md": "same\n" });

		await writeFiles(
			new Map([[nodePath.join(dir, "button.md"), "same\n"]]),
			dir,
		);

		expect(await list(dir)).toEqual(["button.md"]);
	});

	test("renames a directory too", async () => {
		const dir = await outDir({ "Deprecated/dialog.md": "old\n" });

		await writeFiles(
			new Map([[nodePath.join(dir, "deprecated/dialog.md"), "new\n"]]),
			dir,
		);

		expect((await list(dir)).sort()).toEqual([
			"deprecated",
			nodePath.join("deprecated", "dialog.md"),
		]);
	});
});
