import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { resolveComponentFiles } from "../resolveComponentFiles";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "../../scanner/__tests__/fixtures");

describe("resolveComponentFiles", () => {
	test("returns absolute paths in sorted order", () => {
		const files = resolveComponentFiles(FIXTURES, "components/*.tsx");

		expect(files.length).toBeGreaterThan(1);
		expect(files.every((file) => file.startsWith("/"))).toBe(true);
		// Sorted, so the order can't depend on the filesystem — which would change which module wins
		// for a component reachable from several files, and reorder every generated index.
		expect(files).toEqual([...files].sort());
	});

	test("a repeated call returns the same order", () => {
		expect(resolveComponentFiles(FIXTURES, "components/*.tsx")).toEqual(
			resolveComponentFiles(FIXTURES, "components/*.tsx"),
		);
	});

	test("no patterns means no files", () => {
		expect(resolveComponentFiles(FIXTURES, undefined)).toEqual([]);
	});
});
