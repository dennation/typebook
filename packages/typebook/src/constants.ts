/**
 * Package name constant used throughout the codebase.
 * Change this value to rename the tool.
 */
export const PACKAGE_NAME = "typebook";

/** Log prefix for console output */
export const LOG_PREFIX = `[${PACKAGE_NAME}]`;

/** Default inherited providers — packages whose type declarations mark props as inherited */
export const DEFAULT_INHERITED_PROVIDERS = [
	"/node_modules/@types/react/",
	"/node_modules/typescript/lib/",
	"/node_modules/csstype/",
	"/node_modules/@react-aria/",
	"/node_modules/@react-types/",
	"/node_modules/@react-stately/",
];
