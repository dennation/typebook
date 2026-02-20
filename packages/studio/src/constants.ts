/**
 * Package name constant used throughout the codebase.
 * Change this value to rename the tool.
 */
export const PACKAGE_NAME = 'ui-studio'

/** Log prefix for console output */
export const LOG_PREFIX = `[${PACKAGE_NAME}]`

/** Default output file for generated registry */
export const DEFAULT_REGISTRY_FILE = './studio.registry.gen.ts'

/** Default output file for generated component meta */
export const DEFAULT_META_FILE = './studio.meta.gen.ts'

/** Virtual module ID for Vite */
export const VIRTUAL_MODULE_ID = `virtual:${PACKAGE_NAME}-registry`

/** Default glob pattern for story files */
export const DEFAULT_INCLUDE = './src/**/*.stories.tsx'

/** CSS class prefix for Studio UI components */
export const CSS_PREFIX = PACKAGE_NAME

/** Tailwind prefix for isolated styling (variant syntax: st:flex) */
export const TW_PREFIX = 'st'
