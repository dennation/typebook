import { describe, expect, test } from "vitest";
import { visibleProps } from "../propPolicy";
import type { PropInfo } from "../types";

const prop = (name: string, group?: PropInfo["group"]): PropInfo => ({
	name,
	optional: true,
	type: { kind: "string" },
	...(group ? { group } : {}),
});

const props = [
	prop("variant"), // own → shown
	prop("disabled", "element"), // shown group
	prop("onClick", "event:mouse"), // shown group
	prop("aria-label", "aria"), // hidden group
	prop("onPlay", "event:media"), // hidden group
	prop("ref", "react"), // hidden group
];

describe("visibleProps", () => {
	test("keeps own + shown groups, drops hidden groups (defaults)", () => {
		expect(visibleProps(props).map((p) => p.name)).toEqual([
			"variant",
			"disabled",
			"onClick",
		]);
	});

	test("omit hides a prop that would otherwise show", () => {
		expect(
			visibleProps(props, { omit: ["disabled"] }).map((p) => p.name),
		).toEqual(["variant", "onClick"]);
	});

	test("pick rescues a prop from a hidden group", () => {
		expect(
			visibleProps(props, { pick: ["aria-label"] }).map((p) => p.name),
		).toContain("aria-label");
	});

	test("custom hiddenGroups replaces the defaults", () => {
		// hide only mouse events → aria/media/react now show
		const names = visibleProps(props, { hiddenGroups: ["event:mouse"] }).map(
			(p) => p.name,
		);
		expect(names).not.toContain("onClick");
		expect(names).toContain("aria-label");
		expect(names).toContain("onPlay");
	});
});
