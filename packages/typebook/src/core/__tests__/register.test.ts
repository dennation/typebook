import { describe, expect, test } from "vitest";
import { registerComponent } from "../../registerComponent.js";
import { allOf, generate, values } from "../../variants.js";

const MockComponent = () => null;
MockComponent.displayName = "MockComponent";

describe("registerComponent()", () => {
	test("stores component reference", () => {
		const result = registerComponent(MockComponent);
		expect(result.component).toBe(MockComponent);
	});

	test("stores defaultProps from config", () => {
		const result = registerComponent(MockComponent, {
			defaultProps: { children: "Hello" },
		});
		expect(result.defaultProps).toEqual({ children: "Hello" });
	});

	test("defaultProps default to empty object", () => {
		const result = registerComponent(MockComponent);
		expect(result.defaultProps).toEqual({});
	});

	test("props default to empty array (injected by the plugin at build time)", () => {
		const result = registerComponent(MockComponent);
		expect(result.props).toEqual([]);
	});
});

describe("variant config utilities", () => {
	test("allOf() returns correct config", () => {
		const result = registerComponent(MockComponent);
		expect(allOf(result, "size" as any)).toEqual({
			__type: "allOf",
			prop: "size",
		});
	});

	test("values() returns correct config", () => {
		const result = registerComponent(MockComponent);
		expect(values(result, "size" as any, ["sm", "md"] as any)).toEqual({
			__type: "values",
			prop: "size",
			values: ["sm", "md"],
		});
	});

	test("generate() returns correct config", () => {
		const fn = () => "test";
		const result = registerComponent(MockComponent);
		expect(generate(result, "size" as any, fn as any, 3)).toEqual({
			__type: "generate",
			prop: "size",
			fn,
			count: 3,
		});
	});
});
