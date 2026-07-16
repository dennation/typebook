import type { PropGroup } from "./types";

/**
 * A component reference in the config: a function component or a class component. Kept structural
 * (no React import) so the base config type stays React-free — the reference exists only to be
 * type-checked (renaming/deleting the component breaks the config) and statically resolved to its
 * source file; its runtime value is never used.
 */
export type ComponentLike =
	| ((props: never) => unknown)
	// biome-ignore lint/suspicious/noExplicitAny: structural class-component reference
	| (abstract new (
			...args: never[]
	  ) => any);

/** Per-component overrides applied on top of the global defaults. */
export interface ComponentSettings {
	/** Prop names to always hide, even if they'd otherwise be shown. */
	omit?: string[];
	/** Prop names to always show, even if their group is hidden. */
	pick?: string[];
	/** Standard groups to hide for this component (see {@link PropGroup}). */
	hideGroups?: PropGroup[];
	/** Module the component is imported from (for the generated `import { X } from "…"` line). */
	importFrom?: string;
}

/** A `components` entry: a bare component reference, or one with per-component settings. */
export type ComponentEntry =
	| ComponentLike
	| ({ component: ComponentLike } & ComponentSettings);

/**
 * The `typebook.config.ts` shape. `components` lists the components to document as **imported
 * references** — type-checked (a typo or rename is a compile error) and statically resolved to
 * their source files. Settings are read at runtime, so they may be computed.
 */
export interface TypebookFileConfig {
	components: ComponentEntry[];
	/** Additional packages whose declarations mark props as inherited (e.g. `['@heroui/theme']`). */
	inheritedProviders?: string[];
}

/** Identity helper that types a `typebook.config.ts` default export. */
export function defineTypebook(config: TypebookFileConfig): TypebookFileConfig {
	return config;
}
