// The core, and all of it: load a config, scan components, dispatch the commands plugins brought.
// Producing anything — files or otherwise — belongs to the plugins.
export { defineConfig } from "./defineConfig";
export { type LoadedConfig, loadConfig } from "./loadConfig";
export { resolveComponentFiles } from "./resolveComponentFiles";
export {
	listCommands,
	type RunCommandsOptions,
	resolveCommand,
	runCommands,
} from "./runCommands";
export { lazyScan, type ScanOptions, scan } from "./scan";
