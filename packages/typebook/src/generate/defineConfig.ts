import type { TypebookConfig } from "../types";

/** Identity helper — types a `typebook.config.ts` without an `import type` + annotation dance. */
export function defineConfig(config: TypebookConfig): TypebookConfig {
	return config;
}
