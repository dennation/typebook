/**
 * Package name constant used throughout the codebase.
 * Change this value to rename the tool.
 */
export const PACKAGE_NAME = 'typebook'

/** npm package name — used to verify registerComponent() imports at scan time */
export const NPM_PACKAGE_NAME = '@dennation/typebook'

/** React subpath export — used to verify <Snippet> imports at scan time */
export const NPM_REACT_PACKAGE_NAME = '@dennation/typebook/react'

/** Log prefix for console output */
export const LOG_PREFIX = `[${PACKAGE_NAME}]`

/** Default output file for generated registry */
export const DEFAULT_REGISTRY_FILE = './src/ui-registry.gen.ts'

/**
 * Default output directory for extracted <Snippet> source files. Defaults under
 * `public/` so a dev/build server serves them at `DEFAULT_SNIPPET_URL_BASE`.
 */
export const DEFAULT_SNIPPETS_DIR = './public/code-blocks'

/** Default URL path the runtime <Snippet> fetches extracted code from */
export const DEFAULT_SNIPPET_URL_BASE = '/code-blocks'

/** File extension for extracted snippet source files */
export const SNIPPET_FILE_EXT = '.txt'

/** Debounce delay (ms) for file watcher regeneration */
export const DEBOUNCE_MS = 200

/** ID for the injected Studio style element */
export const STYLE_ELEMENT_ID = 'typebook-styles'

/** localStorage key for persisted theme preference */
export const THEME_STORAGE_KEY = 'typebook-theme'

/** Default inherited providers — packages whose type declarations mark props as inherited */
export const DEFAULT_INHERITED_PROVIDERS = [
  '/node_modules/@types/react/',
  '/node_modules/typescript/lib/',
  '/node_modules/csstype/',
  '/node_modules/@react-aria/',
  '/node_modules/@react-types/',
  '/node_modules/@react-stately/',
]
