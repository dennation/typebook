import { describe, expect, test } from "vitest";
import { getComponentMeta } from "../../react/getComponentMeta.js";
import { allOf, generate, values } from "../../react/variants.js";

const MockComponent = () => null;
MockComponent.displayName = "MockComponent";

describe("getComponentMeta()", () => {
	test("stores component reference", () => {
		const result = getComponentMeta(MockComponent);
		expect(result.component).toBe(MockComponent);
	});

	test("stores defaultProps from config", () => {
		const result = getComponentMeta(MockComponent, {
			defaultProps: { children: "Hello" },
		});
		expect(result.defaultProps).toEqual({ children: "Hello" });
	});

	test("defaultProps default to empty object", () => {
		const result = getComponentMeta(MockComponent);
		expect(result.defaultProps).toEqual({});
	});

	test("props default to empty array (injected by the plugin at build time)", () => {
		const result = getComponentMeta(MockComponent);
		expect(result.props).toEqual([]);
	});
});

describe("variant config utilities", () => {
	test("allOf() returns correct config", () => {
		const result = getComponentMeta(MockComponent);
		expect(allOf(result, "size" as any)).toEqual({
			__type: "allOf",
			prop: "size",
		});
	});

	test("values() returns correct config", () => {
		const result = getComponentMeta(MockComponent);
		expect(values(result, "size" as any, ["sm", "md"] as any)).toEqual({
			__type: "values",
			prop: "size",
			values: ["sm", "md"],
		});
	});

	test("generate() returns correct config", () => {
		const fn = () => "test";
		const result = getComponentMeta(MockComponent);
		expect(generate(result, "size" as any, fn as any, 3)).toEqual({
			__type: "generate",
			prop: "size",
			fn,
			count: 3,
		});
	});
});
