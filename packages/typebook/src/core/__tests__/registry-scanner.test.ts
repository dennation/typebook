import { describe, expect, test } from "vitest";
import { parseProgram } from "../ast.js";
import {
	mayContainRegistration,
	scanRegistrations,
} from "../registry-scanner.js";

/** Parse then scan, mirroring how the plugin feeds a pre-parsed program. */
async function scan(filename: string, content: string) {
	return scanRegistrations(await parseProgram(filename, content));
}

describe("mayContainRegistration", () => {
	test("detects registerComponent( substring", () => {
		expect(mayContainRegistration("const x = registerComponent(Foo)")).toBe(
			true,
		);
	});

	test("returns false when registerComponent( absent", () => {
		expect(mayContainRegistration("const x = 1")).toBe(false);
	});
});

describe("scanRegistrations — call discovery", () => {
	test("local (non-exported) register is captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from '@heroui/button'
			const button = registerComponent(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("exported register is also captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			export const button = registerComponent(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("default-exported register is captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			export default registerComponent(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("multiple registers in one file", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			import { Input } from './Input'
			const a = registerComponent(Button)
			const b = registerComponent(Input)
		`,
		);

		expect(result).toHaveLength(2);
	});

	test("locally-declared component is now captured (no import requirement)", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			const MyComp = () => null
			const comp = registerComponent(MyComp)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("file without register() returns empty", async () => {
		const result = await scan("file.tsx", `export const foo = 1`);
		expect(result).toEqual([]);
	});

	test("register() nested inside a function body is still found", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			function Page() {
				const b = registerComponent(Button)
				return null
			}
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("empty file → empty registers", async () => {
		const result = await scan("file.tsx", "");
		expect(result).toEqual([]);
	});

	test("aliased import is still captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent as reg } from '@dennation/typebook'
			import { Button } from './Button'
			const button = reg(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("registerComponent from a different package is ignored", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from 'some-other-lib'
			import { Button } from './Button'
			const button = registerComponent(Button)
		`,
		);

		expect(result).toEqual([]);
	});
});

describe("scanRegistrations — injection target", () => {
	test("records callStart for each register()", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			const button = registerComponent(Button)
		`,
		);

		expect(typeof result[0].callStart).toBe("number");
		expect(result[0].callStart).toBeGreaterThan(0);
	});

	test("no config → newArg insertion after the component argument", async () => {
		const content = `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			const button = registerComponent(Button)
		`;
		const [call] = await scan("file.tsx", content);

		expect(call.inject.kind).toBe("newArg");
		if (call.inject.kind === "newArg") {
			// the insertion point sits right after `Button`
			expect(content.slice(call.inject.at - 6, call.inject.at)).toBe("Button");
		}
	});

	test("object-literal config → insertion just inside the brace", async () => {
		const content = `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			const button = registerComponent(Button, { defaultProps: {} })
		`;
		const [call] = await scan("file.tsx", content);

		expect(call.inject.kind).toBe("object");
		if (call.inject.kind === "object") {
			// the character just before the insertion point is the opening brace
			expect(content[call.inject.at - 1]).toBe("{");
		}
	});

	test("non-literal config → unsupported (props left empty)", async () => {
		const [call] = await scan(
			"file.tsx",
			`
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			const cfg = { defaultProps: {} }
			const button = registerComponent(Button, cfg)
		`,
		);

		expect(call.inject.kind).toBe("unsupported");
	});
});
