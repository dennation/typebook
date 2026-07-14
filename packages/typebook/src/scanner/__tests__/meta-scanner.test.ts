import { describe, expect, test } from "vitest";
import { parseProgram } from "../ast";
import { mayContainMetaCall, scanMetaCalls } from "../meta-scanner";

/** Parse then scan, mirroring how the plugin feeds a pre-parsed program. */
async function scan(filename: string, content: string) {
	return scanMetaCalls(await parseProgram(filename, content));
}

describe("mayContainMetaCall", () => {
	test("detects getComponentMeta( substring", () => {
		expect(mayContainMetaCall("const x = getComponentMeta(Foo)")).toBe(true);
	});

	test("returns false when getComponentMeta( absent", () => {
		expect(mayContainMetaCall("const x = 1")).toBe(false);
	});
});

describe("scanMetaCalls — call discovery", () => {
	test("local (non-exported) getComponentMeta call is captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from '@heroui/button'
			const button = getComponentMeta(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("exported getComponentMeta call is also captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			export const button = getComponentMeta(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("default-exported getComponentMeta call is captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			export default getComponentMeta(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("multiple getComponentMeta calls in one file", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			import { Input } from './Input'
			const a = getComponentMeta(Button)
			const b = getComponentMeta(Input)
		`,
		);

		expect(result).toHaveLength(2);
	});

	test("locally-declared component is now captured (no import requirement)", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			const MyComp = () => null
			const comp = getComponentMeta(MyComp)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("file without getComponentMeta() returns empty", async () => {
		const result = await scan("file.tsx", `export const foo = 1`);
		expect(result).toEqual([]);
	});

	test("getComponentMeta() nested inside a function body is still found", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			function Page() {
				const b = getComponentMeta(Button)
				return null
			}
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("empty file → empty result", async () => {
		const result = await scan("file.tsx", "");
		expect(result).toEqual([]);
	});

	test("aliased import is still captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta as reg } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = reg(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("getComponentMeta from a different package is ignored", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from 'some-other-lib'
			import { Button } from './Button'
			const button = getComponentMeta(Button)
		`,
		);

		expect(result).toEqual([]);
	});
});

describe("scanMetaCalls — injection target", () => {
	test("records callStart for each getComponentMeta()", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = getComponentMeta(Button)
		`,
		);

		expect(typeof result[0].callStart).toBe("number");
		expect(result[0].callStart).toBeGreaterThan(0);
	});

	test("no config → newArg insertion after the component argument", async () => {
		const content = `
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = getComponentMeta(Button)
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
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = getComponentMeta(Button, { defaultProps: {} })
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
			import { getComponentMeta } from '@dennation/typebook/react'
			import { Button } from './Button'
			const cfg = { defaultProps: {} }
			const button = getComponentMeta(Button, cfg)
		`,
		);

		expect(call.inject.kind).toBe("unsupported");
	});
});
