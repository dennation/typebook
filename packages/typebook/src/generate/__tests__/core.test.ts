import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import type { CommandCtx, TypebookConfig } from "../../types";
import {
	lazyScan,
	listCommands,
	resolveCommand,
	runCommands,
	scan,
} from "../index";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "../../scanner/__tests__/fixtures");

/** A plugin contributing one command that records how it was called. */
function recorder(name: string, commandName: string) {
	const calls: CommandCtx[] = [];
	return {
		calls,
		plugin: {
			name,
			commands: {
				[commandName]: {
					describe: `${name} does ${commandName}`,
					run: (ctx: CommandCtx) => {
						calls.push(ctx);
					},
				},
			},
		},
	};
}

describe("scan", () => {
	test("extracts the components a glob matches", async () => {
		const components = await scan({
			root: FIXTURES,
			components: "components/WithHtmlAttrs.tsx",
		});

		expect(components).toHaveLength(1);
		expect(components[0].name).toBe("WithHtmlAttrs");
		// No filtering here — which props to surface is the plugin's policy, not the core's.
		const names = components[0].props.map((p) => p.name);
		expect(names).toContain("variant");
		expect(names).toContain("aria-label");
	});

	// Keeping neighbours out of the scan is a glob concern, not an option: `!` excludes.
	test("a ! pattern excludes", async () => {
		const all = await scan({ root: FIXTURES, components: "components/*.tsx" });
		const some = await scan({
			root: FIXTURES,
			components: ["components/*.tsx", "!components/With*.tsx"],
		});

		expect(some.length).toBeGreaterThan(0);
		expect(some.length).toBeLessThan(all.length);
		expect(some.every((c) => !c.name.startsWith("With"))).toBe(true);
	});

	test("no patterns, no scan", async () => {
		expect(await scan({ root: FIXTURES })).toEqual([]);
	});
});

describe("lazyScan", () => {
	test("does nothing until called, then shares one result", async () => {
		const get = lazyScan({ root: FIXTURES, components: "components/*.tsx" });

		const [a, b] = await Promise.all([get(), get()]);

		// Same array instance: two callers, one TypeScript program.
		expect(a).toBe(b);
		expect(a.length).toBeGreaterThan(1);
	});
});

describe("runCommands", () => {
	test("runs only the command that was named", async () => {
		const first = recorder("a", "a:emit");
		const other = recorder("b", "b:lint");
		const config: TypebookConfig = { plugins: [first.plugin, other.plugin] };

		await runCommands({
			config,
			root: "/proj",
			names: ["a:emit"],
			trigger: "cli",
		});

		expect(first.calls).toHaveLength(1);
		expect(other.calls).toHaveLength(0);
	});

	// A command belongs to one plugin; two claiming a name is a config mistake, not a fan-out.
	test("two plugins claiming one name is an error", async () => {
		const config: TypebookConfig = {
			plugins: [recorder("a", "emit").plugin, recorder("b", "emit").plugin],
		};

		await expect(
			runCommands({ config, root: "/proj", names: ["emit"], trigger: "cli" }),
		).rejects.toThrow(/both register the command "emit"/);
	});

	test("passes root, args and trigger through", async () => {
		const { calls, plugin } = recorder("a", "emit");

		await runCommands({
			config: { plugins: [plugin] },
			root: "/proj",
			names: ["emit"],
			trigger: "dev",
			args: ["--flag"],
		});

		expect(calls[0]).toMatchObject({
			root: "/proj",
			args: ["--flag"],
			trigger: "dev",
		});
	});

	// One scan per run, however many commands ask for it.
	test("commands share a single scan", async () => {
		const first = recorder("a", "a:emit");
		const second = recorder("b", "b:emit");

		await runCommands({
			config: {
				components: "components/Basic.tsx",
				plugins: [first.plugin, second.plugin],
			},
			root: FIXTURES,
			names: ["a:emit", "b:emit"],
			trigger: "cli",
		});

		expect(await first.calls[0].components()).toBe(
			await second.calls[0].components(),
		);
	});

	test("an unknown name runs nothing", async () => {
		const { calls, plugin } = recorder("a", "emit");

		await runCommands({
			config: { plugins: [plugin] },
			root: "/proj",
			names: ["nope"],
			trigger: "cli",
		});

		expect(calls).toHaveLength(0);
	});
});

describe("resolveCommand / listCommands", () => {
	const config: TypebookConfig = {
		plugins: [recorder("a", "emit").plugin, recorder("b", "lint").plugin],
	};

	test("resolveCommand finds every contributor", () => {
		expect(resolveCommand(config, "emit")?.plugin).toBe("a");
		expect(resolveCommand(config, "nope")).toBeNull();
	});

	test("listCommands reports what the plugins brought, sorted", () => {
		expect(listCommands(config).map((c) => c.name)).toEqual(["emit", "lint"]);
	});
});
