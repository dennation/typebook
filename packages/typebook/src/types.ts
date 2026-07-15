import type { RequiredKeysOf } from "type-fest";
import type { Program } from "./scanner/ast";
import type { TypeScriptClient } from "./scanner/ts-client";

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
	 * Sub-plugins that extend `typebook()`. Two kinds, distinguished by which hook they define:
	 * a **`transform`** plugin rewrites each module (e.g. `snippets()` injecting `__snippetSource`);
	 * a **`generate`** plugin consumes the whole project scan (e.g. `aiInstructions()`). A plugin may
	 * define either or both.
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
 * Passed to a {@link TypebookPlugin}'s `transform` for one module. The module is already parsed
 * once by the factory (`program`) and shared across all transform plugins, so a plugin never
 * re-parses. Instead of returning code, a plugin records insertions via `inject`; the factory
 * applies them all back-to-front and returns the rewritten module.
 */
export interface TransformCtx {
	/** The module's source text. */
	code: string;
	/** The module's absolute path. */
	filePath: string;
	/** The parsed module (oxc), shared across transform plugins — do not re-parse. */
	program: Program;
	/** The warm TypeScript client for cross-module resolution, or `null` when unavailable. */
	tsClient: TypeScriptClient | null;
	/** Queue an insertion of `text` at character offset `at`. */
	inject(at: number, text: string): void;
	/** Declare a file this module's output depends on (e.g. a resolved cross-module reference). */
	addWatchFile(file: string): void;
}

/**
 * A sub-plugin of `typebook()`. Mirrors Vite's plugin shape — `apply` gates the command it runs in.
 * Define **`transform`** to rewrite each module (per-module injection), **`generate`** to consume
 * the whole project scan (artifact codegen), or both. `mayTransform` is a cheap string pre-check so
 * a module the plugin can't touch is skipped before the (shared) parse.
 */
export interface TypebookPlugin {
	name: string;
	/** Run only in this command (like Vite's `apply`). Omit to run in both dev and build. */
	apply?: TypebookCommand;
	/** Cheap pre-check: return false to skip a module before parsing. Omit to always consider it. */
	mayTransform?(code: string): boolean;
	/** Rewrite one module via {@link TransformCtx.inject}. Runs per module. */
	transform?(ctx: TransformCtx): void | Promise<void>;
	/** Consume every scanned component after each project scan (build once; dev on change). */
	generate?(docs: ComponentDoc[], ctx: GenerateCtx): void | Promise<void>;
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

/** Props the caller must provide (required keys not covered by defaultProps) */
export type MissingProps<
	Props extends object,
	Defaulted extends keyof Props,
> = Pick<Props, Exclude<RequiredKeysOf<Props>, Defaulted>>;

/** Auto-generate variants from prop type (boolean/literal) */
export interface AllOfConfig {
	__type: "allOf";
	prop: string;
}

/** Manual variant configuration with explicit values */
export interface ValuesConfig {
	__type: "values";
	prop: string;
	values: unknown[];
}

/** Generate variants using a function */
export interface GenerateConfig {
	__type: "generate";
	prop: string;
	fn: () => unknown;
	count: number;
}

/** Variant configuration — either auto (allOf), manual (values), or generated */
export type VariantConfig = AllOfConfig | ValuesConfig | GenerateConfig;
