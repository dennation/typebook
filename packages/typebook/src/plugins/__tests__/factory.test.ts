import { describe, expect, test } from "vitest";
import type { TypebookPlugin } from "../../types";
import { unpluginFactory } from "../factory";

// Drive the raw unplugin hooks to lock the emit timing: build defers generation to `writeBundle`
// (after the bundler empties `outDir`), dev emits at `buildStart`.
function setup(command: "serve" | "build") {
	const calls: string[] = [];
	const recorder: TypebookPlugin = {
		name: "recorder",
		generate: () => {
			calls.push("gen");
		},
	};
	// biome-ignore lint/suspicious/noExplicitAny: driving raw hooks with partial bundler objects
	const hooks = unpluginFactory({ plugins: [recorder] }, {} as any) as any;
	hooks.vite.configResolved({ root: process.cwd(), command });
	return { hooks, calls };
}

describe("factory: generate timing", () => {
	test("build defers emit to writeBundle, not buildStart", async () => {
		const { hooks, calls } = setup("build");
		await hooks.buildStart();
		expect(calls).toEqual([]); // outDir not cleared yet — nothing written
		hooks.buildEnd();
		await hooks.writeBundle();
		expect(calls).toEqual(["gen"]); // emitted after the bundle
	});

	test("build emits once across multiple writeBundle outputs", async () => {
		const { hooks, calls } = setup("build");
		await hooks.buildStart();
		await hooks.writeBundle();
		await hooks.writeBundle();
		expect(calls).toEqual(["gen"]);
	});

	test("dev emits at buildStart", async () => {
		const { hooks, calls } = setup("serve");
		await hooks.buildStart();
		expect(calls).toEqual(["gen"]);
		hooks.buildEnd(); // stop the client
	});
});
