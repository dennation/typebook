#!/usr/bin/env node
import { LOG_PREFIX, PACKAGE_NAME } from "./constants";
import {
	listCommands,
	loadConfig,
	resolveCommand,
	runCommands,
} from "./generate";
import type { TypebookConfig } from "./types";

/** Minimal argv read: the command, then everything after it, minus `--config <path>`. */
function parseArgs(argv: string[]): {
	name?: string;
	args: string[];
	configFile?: string;
} {
	const flag = argv.indexOf("--config");
	const rest =
		flag === -1 ? argv : [...argv.slice(0, flag), ...argv.slice(flag + 2)];
	const [name, ...args] = rest;
	return {
		name,
		args,
		configFile: flag === -1 ? undefined : argv[flag + 1],
	};
}

/** What this project can do — which is whatever its plugins registered. */
function usage(config: TypebookConfig): string {
	const commands = listCommands(config);
	const width = Math.max(0, ...commands.map((c) => c.name.length));
	const lines = commands.length
		? commands.map(
				(c) => `    ${c.name.padEnd(width)}  ${c.describe}  [${c.plugin}]`,
			)
		: ["    (none — no configured plugin registers a command)"];
	return `
  ${PACKAGE_NAME} — artifacts from your components' TypeScript types

  Usage:
    ${PACKAGE_NAME} <command> [args] [--config <path>]

  Commands:
${lines.join("\n")}

  Commands come from the plugins in ${PACKAGE_NAME}.config.{ts,mts,mjs,js}; the core only
  scans your components and hands the result to whichever command you named.
`;
}

async function main(): Promise<void> {
	const { name, args, configFile } = parseArgs(process.argv.slice(2));
	const { config, root } = await loadConfig(process.cwd(), configFile);

	if (!name) {
		console.log(usage(config));
		return;
	}
	if (!resolveCommand(config, name)) {
		console.error(LOG_PREFIX, `unknown command "${name}"`);
		console.error(usage(config));
		process.exitCode = 1;
		return;
	}

	await runCommands({ config, root, names: [name], trigger: "cli", args });
}

main().catch((err: Error) => {
	console.error(LOG_PREFIX, err.message);
	process.exitCode = 1;
});
