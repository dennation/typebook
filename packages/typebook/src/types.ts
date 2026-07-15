export interface TypebookConfig {
	/**
	 * Files to scan for components — a path, list of paths, or globs. Each file's exported
	 * React components are extracted into {@link ComponentDoc}s (one scan, shared by every
	 * consuming plugin). Omit to scan nothing (plugins then have no components to work with).
	 */
	components?: string | string[];
	/** Additional packages whose type declarations mark props as inherited (e.g. ['@heroui/theme']) */
	inheritedProviders?: string[];
	/**
	 * Sub-plugins that consume the project scan (e.g. `llmInstructions()`). Each `generate` runs
	 * after every scan with the full set of components — build once, dev on change.
	 */
	plugins?: TypebookPlugin[];
}

/** Which command the bundler is running — mirrors Vite's `command` (`serve` → `dev`). */
export type TypebookCommand = "dev" | "build";

/** Passed to a {@link TypebookPlugin}'s `generate` on each (re)generation. */
export interface GenerateCtx {
	/** The command in progress, so a plugin can behave differently in dev vs build. */
	command: TypebookCommand;
	/** Project root — relative `writeFile` paths resolve against it. */
	root: string;
	/** Write a file (parent dirs created). Path is absolute or relative to {@link GenerateCtx.root}. */
	writeFile(path: string, content: string): Promise<void>;
}

/**
 * A sub-plugin of `typebook()`: consumes the whole project scan and emits artifacts (docs, AI
 * instructions, …). `apply` gates the command it runs in (like Vite's `apply`).
 */
export interface TypebookPlugin {
	name: string;
	/** Run only in this command (like Vite's `apply`). Omit to run in both dev and build. */
	apply?: TypebookCommand;
	/** Consume every scanned component after each project scan (build once; dev on change). */
	generate(docs: ComponentDoc[], ctx: GenerateCtx): void | Promise<void>;
}

export type PropType =
	| { kind: "literal"; values: string[] }
	| { kind: "boolean" }
	| { kind: "string" }
	| { kind: "number" }
	| { kind: "node" }
	| { kind: "function"; raw?: string }
	| { kind: "unknown"; raw: string };

export interface PropInfo {
	name: string;
	optional: boolean;
	type: PropType;
	/** When true, the prop is inherited from framework types (e.g. React.HTMLAttributes) */
	inherited?: boolean;
	/**
	 * Source text of the default value from the component's parameter destructuring
	 * (e.g. `function Btn({ size = 'md' })` → `"'md'"`). Raw expression as written —
	 * for literals it's the literal source, for non-literals it's the expression text.
	 */
	defaultValue?: string;
	/**
	 * JSDoc description text from the prop's declaration in the source interface or
	 * type alias (the prose written above the field, before any `@tag` lines).
	 */
	description?: string;
	/**
	 * Set from a `@deprecated` JSDoc tag on the prop. `true` when the tag carries no
	 * text, or the tag's text (the migration note / replacement) when it does. Absent
	 * when the prop is not deprecated.
	 */
	deprecated?: boolean | string;
}

/**
 * A fully scanned component: its identity, source location, component-level JSDoc, and props.
 * Produced by the scanner (from the `components` scan) and handed to {@link TypebookPlugin}s. React-free.
 */
export interface ComponentDoc {
	/** Component name (its export identifier). */
	name: string;
	/** Absolute path of the module where the component itself is declared. */
	file: string;
	/** JSDoc prose above the component declaration, if any. */
	description?: string;
	/**
	 * Usage guidance from the component's `@remarks` JSDoc tag — do/don't notes, composition
	 * rules, constraints. Surfaced to AI agents so they have fewer ways to misuse the component.
	 */
	remarks?: string;
	/** `@deprecated` on the component: the tag's note, `true` for a bare tag, absent otherwise. */
	deprecated?: boolean | string;
	props: PropInfo[];
}
