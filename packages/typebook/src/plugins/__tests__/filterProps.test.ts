import { describe, expect, test } from "vitest";
import type { PropInfo } from "../../types";
import type { PropFilter } from "../llm-instructions";
import { DEFAULT_PROP_FILTER, hideGroups } from "../llm-instructions";

const props: PropInfo[] = [
	{ name: "variant", optional: true, type: { kind: "string" } }, // own, no group
	{
		name: "aria-label",
		optional: true,
		type: { kind: "string" },
		group: "aria",
	},
	{
		name: "onClick",
		optional: true,
		type: { kind: "function" },
		group: "event:mouse",
	},
	{
		name: "className",
		optional: true,
		type: { kind: "string" },
		group: "global",
	},
];

const keep = (filter: PropFilter) =>
	props.filter((p) => filter(p, {} as never)).map((p) => p.name);

describe("hideGroups", () => {
	test("drops props in the given groups, keeps own props", () => {
		expect(keep(hideGroups(["aria"]))).toEqual([
			"variant",
			"onClick",
			"className",
		]);
	});

	test("keeps everything when no group matches", () => {
		expect(keep(hideGroups(["event:media"]))).toEqual([
			"variant",
			"aria-label",
			"onClick",
			"className",
		]);
	});

	test("except rescues a name out of a hidden group", () => {
		expect(keep(hideGroups(["global"], { except: ["className"] }))).toEqual([
			"variant",
			"aria-label",
			"onClick",
			"className",
		]);
		expect(keep(hideGroups(["global"]))).not.toContain("className");
	});
});

describe("DEFAULT_PROP_FILTER", () => {
	test("keeps own props + className, hides aria and events", () => {
		expect(keep(DEFAULT_PROP_FILTER)).toEqual(["variant", "className"]);
	});

	test("hides the react group but keeps children", () => {
		const react = (name: string): PropInfo => ({
			name,
			optional: true,
			type: { kind: "string" },
			group: "react",
		});
		expect(DEFAULT_PROP_FILTER(react("ref"), {} as never)).toBe(false);
		expect(DEFAULT_PROP_FILTER(react("children"), {} as never)).toBe(true);
	});
});
