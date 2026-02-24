/**
 * Package name constant used throughout the codebase.
 * Change this value to rename the tool.
 */
export const PACKAGE_NAME = 'ui-studio'

/** Log prefix for console output */
export const LOG_PREFIX = `[${PACKAGE_NAME}]`

/** Default output file for generated registry */
export const DEFAULT_REGISTRY_FILE = './ui-studio-registry.gen.ts'

/** Default output file for generated component meta */
export const DEFAULT_META_FILE = './ui-studio-meta.gen.ts'

/** Virtual module ID for Vite */
export const VIRTUAL_MODULE_ID = `virtual:${PACKAGE_NAME}-registry`

/** Default glob pattern for story files */
export const DEFAULT_INCLUDE = './src/**/*.stories.tsx'

/** Default glob pattern for page files */
export const DEFAULT_PAGES_INCLUDE = './src/**/*.docs.tsx'

/** CSS class prefix for Studio UI components */
export const CSS_PREFIX = PACKAGE_NAME

/** Tailwind prefix for isolated styling (variant syntax: st:flex) */
export const TW_PREFIX = 'st'

/** Debounce delay (ms) for file watcher regeneration */
export const DEBOUNCE_MS = 200

/** ID for the injected Studio style element */
export const STYLE_ELEMENT_ID = 'ui-studio-styles'

/** Default page name for auto-generated component docs */
export const DEFAULT_DOCS_PAGE = 'Docs'

/** localStorage key for persisted theme preference */
export const THEME_STORAGE_KEY = 'ui-studio-theme'
