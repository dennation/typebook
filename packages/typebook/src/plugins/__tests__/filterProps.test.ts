import { describe, expect, test } from "vitest";
import type { PropGroup, PropInfo } from "../../types";
import { DEFAULT_PROP_FILTER, hideGroups } from "../llm-instructions";
import {
	asPropFilterFn,
	type PropFilter,
} from "../llm-instructions/filterProps";

const prop = (name: string, group?: PropGroup): PropInfo => ({
	name,
	optional: true,
	type: { kind: "string" },
	...(group ? { group } : {}),
});

const keep = (filter: PropFilter, p: PropInfo) =>
	asPropFilterFn(filter)(p, {} as never);

describe("hideGroups", () => {
	test("maps each group to false", () => {
		expect(hideGroups(["aria", "element"])).toEqual({
			aria: false,
			element: false,
		});
	});
});

describe("asPropFilterFn (map)", () => {
	test("a group flag hides props in that group", () => {
		expect(keep({ element: false }, prop("disabled", "element"))).toBe(false);
	});

	test("a prop name wins over its group", () => {
		expect(
			keep({ element: false, disabled: true }, prop("disabled", "element")),
		).toBe(true);
	});

	test("an unlisted prop is kept", () => {
		expect(keep({ element: false }, prop("variant"))).toBe(true);
	});

	test("passes a predicate through unchanged", () => {
		const only = (p: PropInfo) => p.name === "keepme";
		expect(keep(only, prop("keepme"))).toBe(true);
		expect(keep(only, prop("other"))).toBe(false);
	});
});

describe("DEFAULT_PROP_FILTER", () => {
	test("hides the element / aria / event groups", () => {
		expect(keep(DEFAULT_PROP_FILTER, prop("formEncType", "element"))).toBe(
			false,
		);
		expect(keep(DEFAULT_PROP_FILTER, prop("aria-label", "aria"))).toBe(false);
		expect(keep(DEFAULT_PROP_FILTER, prop("onClick", "event:mouse"))).toBe(
			false,
		);
	});

	test("keeps the rescued natives and children", () => {
		expect(keep(DEFAULT_PROP_FILTER, prop("disabled", "element"))).toBe(true);
		expect(keep(DEFAULT_PROP_FILTER, prop("href", "element"))).toBe(true);
		expect(keep(DEFAULT_PROP_FILTER, prop("children", "react"))).toBe(true);
	});

	test("keeps an ungrouped prop", () => {
		expect(keep(DEFAULT_PROP_FILTER, prop("variant"))).toBe(true);
	});
});
