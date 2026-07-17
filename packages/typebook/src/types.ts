export interface TypebookConfig {
	/**
	 * Files to scan for components — a path, list of paths, or globs. Each file's exported
	 * React components are extracted into {@link ComponentInfo}s (one scan, shared by every
	 * consuming plugin). Omit to scan nothing (plugins then have no components to work with).
	 */
	components?: string | string[];
	/**
	 * Sub-plugins that consume the project scan (e.g. `llmInstructions()`). Each `generate` runs
	 * after every scan with the full set of components — build once, dev on change.
	 */
	plugins?: TypebookPlugin[];
	/**
	 * Fail the build when a plugin's `generate` throws, instead of logging a warning and continuing.
	 * Off by default (a dev-server keeps running on error); turn it on in CI so a broken generation
	 * doesn't pass silently. Only applies in `build` — `dev` always warns and keeps serving.
	 */
	failOnError?: boolean;
}

/** Which command the bundler is running — mirrors Vite's `command` (`serve` → `dev`). */
export type TypebookCommand = "dev" | "build";

/** Passed to a {@link TypebookPlugin}'s `generate` on each (re)generation. */
export interface GenerateCtx {
	/** The command in progress, so a plugin can behave differently in dev vs build. */
	command: TypebookCommand;
	/** Project root — relative `writeFile` paths resolve against it. */
	root: string;
	/**
	 * Absolute path of the bundler's output directory (Vite `build.outDir`), when known — `build`
	 * only, and only for bundlers that expose it. `undefined` in dev and for the rest.
	 */
	outDir?: string;
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
	generate(docs: ComponentInfo[], ctx: GenerateCtx): void | Promise<void>;
}

export type PropType =
	| { kind: "literal"; values: string[] }
	| { kind: "boolean" }
	| { kind: "string" }
	| { kind: "number" }
	| { kind: "node"; name: "ReactNode" | "ReactElement" | "ReactPortal" }
	| { kind: "function"; raw?: string }
	| { kind: "unknown"; raw: string };

/**
 * Standard attribute/event group a prop's name belongs to, grounded in the specs mirrored by
 * `@types/react` (WAI-ARIA, WHATWG global & per-element attributes, HTML microdata/RDFa, SVG, and
 * the DOM event categories). `undefined` for a component's own (non-standard) prop. Lets a consumer
 * decide per group which props to surface (e.g. hide `aria`/`event:media`, keep `element`).
 */
export type PropGroup =
	| "aria"
	| "global"
	| "element"
	| "microdata"
	| "rdfa"
	| "data"
	| "svg"
	| "react"
	| "event:mouse"
	| "event:keyboard"
	| "event:focus"
	| "event:form"
	| "event:pointer"
	| "event:touch"
	| "event:drag"
	| "event:wheel"
	| "event:scroll"
	| "event:clipboard"
	| "event:composition"
	| "event:selection"
	| "event:media"
	| "event:image"
	| "event:animation"
	| "event:transition"
	| "event:toggle"
	| "capture";

export interface PropInfo {
	name: string;
	optional: boolean;
	type: PropType;
	/**
	 * The package the prop's declarations come from when it's inherited from framework types
	 * (e.g. `"@types/react"`, `"csstype"`) — the npm package name parsed from the declaration path.
	 * Its presence is what marks a prop as inherited; **absent for a component's own props**.
	 */
	inheritedFrom?: string;
	/**
	 * Standard group this prop's name belongs to (see {@link PropGroup}), or absent when the name
	 * isn't a recognised standard attribute. Classified by name, so it's the same whether the
	 * attribute is inherited or the component declares it itself — use {@link inheritedFrom} to tell
	 * own props from inherited ones.
	 */
	group?: PropGroup;
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
export interface ComponentInfo {
	/** Component name (its export identifier). */
	name: string;
	/**
	 * Absolute path of the module where the component itself is **declared**. For a re-exported
	 * third-party component (`export { Toaster } from "sonner"`) this points into `node_modules`,
	 * not your source — derive output paths from {@link sourceFile} instead, and compare the two to
	 * spot foreign re-exports (`file` outside your project, `sourceFile` inside it).
	 */
	file: string;
	/**
	 * Absolute path of the **scanned module** that surfaced this component — the file under your
	 * `components` glob. Equals {@link file} for a component declared in its own module; differs for
	 * a re-export. Use this for co-located output (`sourceFile.replace(/\.tsx$/, ".md")`).
	 */
	sourceFile: string;
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
