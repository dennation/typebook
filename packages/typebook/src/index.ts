// The core, and all of it: load a config, scan components for their props, dispatch the commands
// plugins brought. It produces nothing itself — files, diagnostics, whatever else are the plugins'
// business, and it has no opinion about them.
//
// Pulls in `typescript` at runtime; type-only imports stay weightless.
export {
	defineConfig,
	type LoadedConfig,
	listCommands,
	loadConfig,
	type RunCommandsOptions,
	resolveCommand,
	resolveComponentFiles,
	runCommands,
	type ScanOptions,
	scan,
} from "./generate";
export * from "./scanner";
export type {
	CommandCtx,
	PluginCommand,
	TypebookConfig,
	TypebookPlugin,
} from "./types";
