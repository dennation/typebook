import type { TypeScriptClient } from "../scanner";
import type { CommandCtx, TypebookConfig, TypebookPlugin } from "../types";
import { lazyScan } from "./scan";

export interface RunCommandsOptions {
	config: TypebookConfig;
	root: string;
	/** Command names to run, in order. */
	names: string[];
	trigger: CommandCtx["trigger"];
	args?: string[];
	client?: TypeScriptClient;
}

/**
 * Run the named commands, whichever plugins contributed them.
 *
 * The core neither owns commands nor knows what they do — it resolves each name to the plugin that
 * registered it and runs it, handing every command the same lazy scan.
 */
export async function runCommands(options: RunCommandsOptions): Promise<void> {
	const { config, root, names, trigger, args = [], client } = options;
	const commands = names
		.map((name) => resolveCommand(config, name))
		.filter((command) => command !== null);
	if (commands.length === 0) return;

	const ctx: CommandCtx = {
		root,
		args,
		trigger,
		components: lazyScan({ root, components: config.components, client }),
	};
	for (const { run } of commands) await run(ctx);
}

/**
 * The plugin that registered `name`, or `null`. A command belongs to exactly one plugin — two
 * plugins claiming one name is a configuration mistake, not something to silently run twice.
 */
export function resolveCommand(config: TypebookConfig, name: string) {
	const found = (config.plugins ?? []).flatMap((plugin) => {
		const command = plugin.commands?.[name];
		return command ? [{ plugin: plugin.name, ...command }] : [];
	});
	if (found.length > 1)
		throw new Error(
			`plugins ${found.map((c) => `"${c.plugin}"`).join(" and ")} both register the command "${name}"`,
		);
	return found[0] ?? null;
}

/** Every command the configured plugins contribute, for help output. */
export function listCommands(
	config: TypebookConfig,
): { name: string; plugin: string; describe: string }[] {
	const all = (config.plugins ?? []).flatMap((plugin: TypebookPlugin) =>
		Object.entries(plugin.commands ?? {}).map(([name, command]) => ({
			name,
			plugin: plugin.name,
			describe: command.describe,
		})),
	);
	return all.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
