import { describe, expect, test } from "vitest";
import { componentSource } from "../componentSource";

const Button = () => null;
Button.displayName = "Button";

describe("componentSource()", () => {
	test("self-closes when there are no children", () => {
		expect(componentSource(Button, { size: "lg" })).toBe(
			'<Button size="lg" />',
		);
	});

	test("renders string children as text content", () => {
		expect(componentSource(Button, { size: "lg", children: "Click me" })).toBe(
			'<Button size="lg">Click me</Button>',
		);
	});

	test("formats each value kind", () => {
		expect(
			componentSource(Button, {
				str: "x",
				num: 3,
				on: true,
				off: false,
				fn: () => {},
				obj: { a: 1 },
			}),
		).toBe(
			'<Button str="x" num={3} on off={false} fn={fn} obj={{"a":1}} />',
		);
	});

	test("skips undefined props", () => {
		expect(componentSource(Button, { size: undefined, color: "red" })).toBe(
			'<Button color="red" />',
		);
	});

	test("renders numeric children", () => {
		expect(componentSource(Button, { children: 42 })).toBe(
			"<Button>42</Button>",
		);
	});

	test("self-closes for non-text children (node)", () => {
		expect(componentSource(Button, { children: { $$typeof: Symbol() } })).toBe(
			"<Button>{/* … */}</Button>",
		);
	});

	test("falls back to the function name, then 'Component'", () => {
		const Named = () => null;
		expect(componentSource(Named, {})).toBe("<Named />");
		expect(componentSource(() => null, {})).toBe("<Component />");
	});
});
