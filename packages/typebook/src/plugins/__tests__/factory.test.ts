import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { loadConfig, runCommands } from "../../generate";
import { unpluginFactory } from "../factory";

const tmp = () => mkdtemp(path.join(tmpdir(), "typebook-"));

/** A plugin registering one command that writes a file, plus what the config runs and when. */
async function project(timing: string): Promise<string> {
	const root = await tmp();
	await writeFile(
		path.join(root, "typebook.config.mjs"),
		`import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
export default {
  ${timing}
  plugins: [{
    name: "rec",
    commands: {
      emit: {
        describe: "write a file",
        async run(ctx) {
          await mkdir(path.join(ctx.root, "out"), { recursive: true })
          await writeFile(path.join(ctx.root, "out/a.md"), "hi\\n")
        },
      },
    },
  }],
}
`,
	);
	return root;
}

function hooks(root: string, command: "serve" | "build") {
	// biome-ignore lint/suspicious/noExplicitAny: driving raw hooks with partial bundler objects
	const plugin = unpluginFactory({}, {} as any) as any;
	plugin.vite.configResolved({ root, command });
	return plugin;
}

const missing = (file: string) =>
	expect(readFile(file, "utf8")).rejects.toThrow();

describe("factory: runs the commands the config names", () => {
	test("build runs what `build` lists", async () => {
		const root = await project(`build: ["emit"],`);

		await hooks(root, "build").buildStart();

		expect(await readFile(path.join(root, "out/a.md"), "utf8")).toBe("hi\n");
	});

	test("dev runs what `dev` lists", async () => {
		const root = await project(`dev: ["emit"],`);

		await hooks(root, "serve").buildStart();

		expect(await readFile(path.join(root, "out/a.md"), "utf8")).toBe("hi\n");
	});

	// Nothing listed for this command → the core does nothing at all, not even a scan.
	test("a command listed for the other trigger does not run", async () => {
		const root = await project(`dev: ["emit"],`);

		await hooks(root, "build").buildStart();

		await missing(path.join(root, "out/a.md"));
	});

	test("an empty config does nothing", async () => {
		const root = await project("");

		await hooks(root, "build").buildStart();

		await missing(path.join(root, "out/a.md"));
	});

	// The bundler plugin is a thin wrapper, not a second implementation: what it does must equal
	// what running the same command from the command line does.
	test("a bundler run matches running the command directly", async () => {
		const viaBundler = await project(`build: ["emit"],`);
		await hooks(viaBundler, "build").buildStart();

		const direct = await project(`build: ["emit"],`);
		const { config } = await loadConfig(direct);
		await runCommands({
			config,
			root: direct,
			names: ["emit"],
			trigger: "cli",
		});

		expect(await readFile(path.join(viaBundler, "out/a.md"), "utf8")).toBe(
			await readFile(path.join(direct, "out/a.md"), "utf8"),
		);
	});

	test("a failing command fails the build", async () => {
		const root = await tmp();
		await writeFile(
			path.join(root, "typebook.config.mjs"),
			`export default { build: ["boom"], plugins: [{ name: "b", commands: { boom: { describe: "x", run() { throw new Error("nope") } } } }] }\n`,
		);

		await expect(hooks(root, "build").buildStart()).rejects.toThrow("nope");
	});
});
