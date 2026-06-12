import ts from "typescript";
import { LOG_PREFIX } from "../constants.js";

/**
 * Resolve the list of source files a project includes, via its `tsconfig.json`.
 * Shared by the registry and snippet builders so both scan exactly the files
 * TypeScript itself would compile. Returns an empty list (with a warning) when
 * no tsconfig can be found or read.
 */
export function getSourceFilesFromTsConfig(cwd: string): string[] {
	const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, "tsconfig.json");
	if (!configPath) {
		console.warn(LOG_PREFIX, "tsconfig.json not found, no files to scan");
		return [];
	}
	const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
	if (configFile.error) {
		console.warn(
			LOG_PREFIX,
			"Failed to read tsconfig.json:",
			ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"),
		);
		return [];
	}
	const { fileNames } = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		cwd,
	);
	return fileNames;
}
