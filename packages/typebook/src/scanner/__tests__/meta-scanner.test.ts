import { describe, expect, test } from "vitest";
import { parseProgram } from "../ast";
import { mayContainMetaCall, scanMetaCalls } from "../meta-scanner";

/** Parse then scan, mirroring how the plugin feeds a pre-parsed program. */
async function scan(filename: string, content: string) {
	return scanMetaCalls(await parseProgram(filename, content));
}

describe("mayContainMetaCall", () => {
	test("detects defineStories( substring", () => {
		expect(mayContainMetaCall("const x = defineStories(Foo)")).toBe(true);
	});

	test("returns false when defineStories( absent", () => {
		expect(mayContainMetaCall("const x = 1")).toBe(false);
	});
});

describe("scanMetaCalls — call discovery", () => {
	test("local (non-exported) defineStories call is captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from '@heroui/button'
			const button = defineStories(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("exported defineStories call is also captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			export const button = defineStories(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("default-exported defineStories call is captured", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			export default defineStories(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("multiple defineStories calls in one file", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			import { Input } from './Input'
			const a = defineStories(Button)
			const b = defineStories(Input)
		`,
		);

		expect(result).toHaveLength(2);
	});

	test("locally-declared component is now captured (no import requirement)", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			const MyComp = () => null
			const comp = defineStories(MyComp)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("file without defineStories() returns empty", async () => {
		const result = await scan("file.tsx", `export const foo = 1`);
		expect(result).toEqual([]);
	});

	test("defineStories() nested inside a function body is still found", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			function Page() {
				const b = defineStories(Button)
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
			import { defineStories as reg } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = reg(Button)
		`,
		);

		expect(result).toHaveLength(1);
	});

	test("defineStories from a different package is ignored", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from 'some-other-lib'
			import { Button } from './Button'
			const button = defineStories(Button)
		`,
		);

		expect(result).toEqual([]);
	});
});

describe("scanMetaCalls — injection target", () => {
	test("records callStart for each defineStories()", async () => {
		const result = await scan(
			"file.tsx",
			`
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = defineStories(Button)
		`,
		);

		expect(typeof result[0].callStart).toBe("number");
		expect(result[0].callStart).toBeGreaterThan(0);
	});

	test("no config → newArg insertion after the component argument", async () => {
		const content = `
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = defineStories(Button)
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
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			const button = defineStories(Button, { defaultProps: {} })
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
			import { defineStories } from '@dennation/typebook/react'
			import { Button } from './Button'
			const cfg = { defaultProps: {} }
			const button = defineStories(Button, cfg)
		`,
		);

		expect(call.inject.kind).toBe("unsupported");
	});
});
