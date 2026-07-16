import { resolve } from "node:path";
import ts from "typescript";
import { DEFAULT_INHERITED_PROVIDERS, LOG_PREFIX } from "../constants";
import type { ComponentInfo, PropInfo, PropType } from "../types";
import { classifyPropGroup } from "./propGroup";

export class TypeScriptClient {
	private service: ts.LanguageService | null = null;
	private program: ts.Program | null = null;
	private checker: ts.TypeChecker | null = null;

	// tsconfig compiler options — read once.
	private options: ts.CompilerOptions | null = null;
	// The program's files mapped to their versions — the single source of truth for both. Backs
	// the LanguageServiceHost: the keys are the root file set, and bumping a file's version tells
	// the service its snapshot changed, so it re-reads and reparses only that file.
	private readonly fileVersions = new Map<string, number>();
	// In-memory content overrides keyed by absolute path. The bundler `transform` hook may hand us
	// code already rewritten by an earlier plugin (e.g. TanStack Router's code-splitting), whose
	// character offsets differ from disk. Extracting against the same text the scanner parsed keeps
	// oxc and TypeScript offsets in lockstep; the file's imports still resolve through the program.
	private readonly overrides = new Map<string, string>();

	private readonly inheritedPaths: string[];

	constructor(
		private cwd: string,
		inheritedProviders?: string[],
	) {
		const userPaths = (inheritedProviders ?? []).map(
			(pkg) => `/node_modules/${pkg}/`,
		);
		this.inheritedPaths = [...DEFAULT_INHERITED_PROVIDERS, ...userPaths];
	}

	async start(): Promise<void> {
		if (!this.options) {
			const configPath = ts.findConfigFile(
				this.cwd,
				ts.sys.fileExists,
				"tsconfig.json",
			);
			if (!configPath) {
				throw new Error("tsconfig.json not found");
			}

			const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
			const { options, fileNames } = ts.parseJsonConfigFileContent(
				config,
				ts.sys,
				this.cwd,
			);
			this.options = options;
			for (const f of fileNames) this.fileVersions.set(f, 0);
		}

		if (!this.service) {
			// A LanguageService keeps ONE program warm across edits (the model tsserver/editors use):
			// the default lib and node_modules `.d.ts` are parsed once and reused via the
			// DocumentRegistry, so an incremental rebuild reparses only the files whose version we
			// bumped — orders of magnitude cheaper than recreating the whole program on each change.
			this.service = ts.createLanguageService(
				this.createHost(),
				ts.createDocumentRegistry(),
			);
		}

		this.refreshProgram();
	}

	stop(): void {
		this.service?.dispose();
		this.service = null;
		this.program = null;
		this.checker = null;
		this.options = null;
		this.fileVersions.clear();
	}

	private createHost(): ts.LanguageServiceHost {
		return {
			getScriptFileNames: () => [...this.fileVersions.keys()],
			getScriptVersion: (f) => String(this.fileVersions.get(f) ?? 0),
			getScriptSnapshot: (f) => {
				const override = this.overrides.get(f);
				if (override !== undefined)
					return ts.ScriptSnapshot.fromString(override);
				const text = ts.sys.readFile(f);
				return text === undefined
					? undefined
					: ts.ScriptSnapshot.fromString(text);
			},
			getCurrentDirectory: () => this.cwd,
			getCompilationSettings: () => this.options ?? {},
			getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
			fileExists: ts.sys.fileExists,
			readFile: ts.sys.readFile,
			readDirectory: ts.sys.readDirectory,
			directoryExists: ts.sys.directoryExists,
			getDirectories: ts.sys.getDirectories,
		};
	}

	/** Pull the latest warm program from the service. */
	private refreshProgram(): void {
		this.program = this.service?.getProgram() ?? null;
		this.checker = this.program?.getTypeChecker() ?? null;
	}

	/**
	 * Extract a {@link ComponentInfo} for every exported React component in a file — the scan
	 * surface for `components`-configured files. No `getComponentMeta` wrapper needed: each
	 * export is inspected by type, and the ones that are components (call signature returning a
	 * React node, or a class construct signature) yield a doc. Non-component exports are skipped.
	 */
	async getExportedComponentInfos(
		filePath: string,
		content?: string,
	): Promise<ComponentInfo[]> {
		if (!this.program || !this.checker) {
			await this.start();
		}

		const absPath = resolve(this.cwd, filePath);
		if (content !== undefined) this.setOverride(absPath, content);

		const sourceFile = this.program?.getSourceFile(absPath);
		const checker = this.checker;
		if (!sourceFile || !checker) return [];

		const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
		if (!moduleSymbol) return [];

		const docs: ComponentInfo[] = [];
		for (const exp of checker.getExportsOfModule(moduleSymbol)) {
			const doc = this.exportToComponentInfo(checker, exp, absPath);
			if (doc) docs.push(doc);
		}
		return docs;
	}

	/** Turn one module export into a {@link ComponentInfo}, or `null` when it isn't a component. */
	private exportToComponentInfo(
		checker: ts.TypeChecker,
		exp: ts.Symbol,
		fallbackFile: string,
	): ComponentInfo | null {
		const resolved =
			exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
		const decl = resolved.getDeclarations()?.[0];
		if (!decl) return null;

		const nameNode = declarationNameNode(decl);
		if (!nameNode) return null;

		const props = this.extractComponentProps(checker, nameNode);
		if (props === null) return null; // not a component

		const info: Omit<ComponentInfo, "props"> = {
			name: exp.getName(),
			file: decl.getSourceFile().fileName,
		};
		const description = getSymbolDescription(checker, resolved);
		if (description) info.description = description;
		const remarks = getSymbolRemarks(checker, resolved);
		if (remarks) info.remarks = remarks;
		const deprecated = getSymbolDeprecation(checker, resolved);
		if (deprecated !== undefined) info.deprecated = deprecated;
		return { ...info, props };
	}

	/**
	 * Extract props from a component identified by its declaration name node, or `null` when the
	 * node isn't a component. A component has a call signature returning a React node (function
	 * component) or a construct signature (class component); its first parameter is the props type.
	 */
	private extractComponentProps(
		checker: ts.TypeChecker,
		componentNode: ts.Node,
	): PropInfo[] | null {
		const type = checker.getTypeAtLocation(componentNode);
		const callSigs = type.getCallSignatures();
		const constructSigs = type.getConstructSignatures();

		let sig: ts.Signature;
		if (callSigs.length > 0) {
			sig = callSigs[0];
			// ponytail: component detection by return-type string (ReactNode/Element). Covers
			// function components; class components fall to the construct-signature branch.
			if (!isReactReturnType(checker, sig.getReturnType())) return null;
		} else if (constructSigs.length > 0) {
			sig = constructSigs[0];
		} else {
			return null;
		}

		const propsParam = sig.getParameters()[0];
		let props: PropInfo[] = [];
		if (propsParam) {
			props = this.extractPropsFromType(
				checker,
				checker.getTypeOfSymbol(propsParam),
			);
		}

		const inherited = this.getInheritedPropNames(checker, componentNode);
		const defaults = this.getParamDefaultProps(checker, componentNode);
		return props.map((p) => {
			let next = p;
			// Origin gates classification: only framework-inherited attributes get a standard
			// `group` (by name); a component's own prop stays ungrouped (its distinctive API).
			if (inherited.has(p.name)) {
				next = { ...next, inherited: true };
				const group = classifyPropGroup(p.name);
				if (group) next = { ...next, group };
			}
			const def = defaults.get(p.name);
			if (def !== undefined) next = { ...next, defaultValue: def };
			return next;
		});
	}

	/**
	 * Every project source file currently in the warm program — the scan surface for
	 * {@link collectComponentInfos}. Declaration files, `node_modules`, and files outside
	 * the project root are excluded so only the consumer's own components are scanned.
	 */
	projectSourceFiles(): { fileName: string; text: string }[] {
		const program = this.program;
		if (!program) return [];
		const files: { fileName: string; text: string }[] = [];
		for (const sf of program.getSourceFiles()) {
			if (sf.isDeclarationFile) continue;
			if (sf.fileName.includes("/node_modules/")) continue;
			if (!sf.fileName.startsWith(this.cwd)) continue;
			files.push({ fileName: sf.fileName, text: sf.text });
		}
		return files;
	}

	/**
	 * Overlay `content` as the in-memory snapshot for `absPath` and refresh the warm program so the
	 * file is reparsed from it. A no-op when the content is unchanged, so repeated extraction of an
	 * untouched file doesn't churn the program.
	 */
	private setOverride(absPath: string, content: string): void {
		if (this.overrides.get(absPath) === content) return;
		this.overrides.set(absPath, content);
		this.fileVersions.set(absPath, (this.fileVersions.get(absPath) ?? 0) + 1);
		this.refreshProgram();
	}

	/**
	 * Extract default values from the component's first parameter object
	 * destructuring (e.g. `function Btn({ size = 'md' })`). Returns a map of
	 * prop name → initializer source text. Only handles destructuring in the
	 * parameter list; defaults applied in the function body are ignored.
	 */
	private getParamDefaultProps(
		checker: ts.TypeChecker,
		componentNode: ts.Node,
	): Map<string, string> {
		const defaultProps = new Map<string, string>();

		const symbol = checker.getSymbolAtLocation(componentNode);
		if (!symbol) return defaultProps;

		const aliasedSymbol =
			symbol.flags & ts.SymbolFlags.Alias
				? checker.getAliasedSymbol(symbol)
				: symbol;
		const declarations = aliasedSymbol.getDeclarations();
		if (!declarations || declarations.length === 0) return defaultProps;

		for (const decl of declarations) {
			const fn = resolveFunctionLikeFromDeclaration(decl);
			if (!fn) continue;

			const firstParam = fn.parameters[0];
			if (!firstParam) continue;

			collectDefaultPropsFromBindingName(firstParam.name, defaultProps);
			if (defaultProps.size > 0) break;
		}

		return defaultProps;
	}

	/**
	 * Get the original Props type from a component and classify each property
	 * as inherited (all declarations in framework paths) or own.
	 */
	private getInheritedPropNames(
		checker: ts.TypeChecker,
		componentNode: ts.Node,
	): Set<string> {
		const inherited = new Set<string>();

		const componentType = checker.getTypeAtLocation(componentNode);
		const signatures = [
			...componentType.getCallSignatures(),
			...componentType.getConstructSignatures(),
		];

		if (signatures.length === 0) return inherited;

		const firstSig = signatures[0];
		const params = firstSig.getParameters();
		if (params.length === 0) return inherited;

		const propsParam = params[0];
		const propsType = checker.getTypeOfSymbol(propsParam);

		for (const prop of propsType.getProperties()) {
			if (this.isInheritedProp(prop)) {
				inherited.add(prop.getName());
			}
		}

		return inherited;
	}

	/**
	 * A prop is inherited if ALL its declarations come from excluded type packages.
	 * Props with no declarations (synthetic) are considered own.
	 */
	private isInheritedProp(symbol: ts.Symbol): boolean {
		const declarations = symbol.getDeclarations();
		if (!declarations || declarations.length === 0) return false;

		return declarations.every((decl) => {
			const fileName = decl.getSourceFile().fileName;
			return this.inheritedPaths.some((p) => fileName.includes(p));
		});
	}

	private extractPropsFromType(
		checker: ts.TypeChecker,
		type: ts.Type,
	): PropInfo[] {
		const props: PropInfo[] = [];
		const properties = type.getProperties();

		for (const prop of properties) {
			const propName = prop.getName();

			// For Pick<T, K> types, we need to get the type directly from the symbol
			// instead of from declarations (which don't exist for mapped types)
			const propType = checker.getTypeOfSymbol(prop);
			const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
			const typeInfo = this.convertTsType(checker, propType);
			const description = getSymbolDescription(checker, prop);

			const info: PropInfo = {
				name: propName,
				optional: isOptional,
				type: typeInfo,
			};
			if (description) info.description = description;
			// `@default`/`@defaultValue` JSDoc tag — the only default that survives into a
			// `.d.ts` (parameter-destructuring defaults don't), so docs sourced from a built
			// package can still show defaults. A destructuring default, when available, wins
			// (applied later from the component's own source).
			const defaultTag = getSymbolDefaultTag(checker, prop);
			if (defaultTag) info.defaultValue = defaultTag;
			// `@deprecated` JSDoc tag — `true` for a bare tag, the tag's text (the
			// replacement / migration note) when it carries one.
			const deprecated = getSymbolDeprecation(checker, prop);
			if (deprecated !== undefined) info.deprecated = deprecated;

			props.push(info);
		}

		return props;
	}

	private convertTsType(checker: ts.TypeChecker, type: ts.Type): PropType {
		const typeString = checker.typeToString(type);
		const flags = type.flags;

		if (flags & ts.TypeFlags.Any) {
			return { kind: "unknown", raw: "any" };
		}

		if (type.isUnion()) {
			const types = type.types.filter(
				(t) =>
					!(t.flags & ts.TypeFlags.Undefined) && !(t.flags & ts.TypeFlags.Null),
			);

			if (types.length === 1) {
				return this.convertTsType(checker, types[0]);
			}

			if (types.every((t) => t.flags & ts.TypeFlags.StringLiteral)) {
				const values = types.map((t) => (t as ts.StringLiteralType).value);
				return { kind: "literal", values };
			}

			if (types.every((t) => t.flags & ts.TypeFlags.BooleanLiteral)) {
				return { kind: "boolean" };
			}

			if (types.every((t) => t.flags & ts.TypeFlags.NumberLiteral)) {
				return { kind: "number" };
			}
		}

		if (
			type.flags & ts.TypeFlags.Boolean ||
			type.flags & ts.TypeFlags.BooleanLiteral
		) {
			return { kind: "boolean" };
		}

		if (
			type.flags & ts.TypeFlags.String ||
			type.flags & ts.TypeFlags.StringLiteral
		) {
			if (type.flags & ts.TypeFlags.StringLiteral) {
				return {
					kind: "literal",
					values: [(type as ts.StringLiteralType).value],
				};
			}
			return { kind: "string" };
		}

		if (
			type.flags & ts.TypeFlags.Number ||
			type.flags & ts.TypeFlags.NumberLiteral
		) {
			return { kind: "number" };
		}

		const signatures = type.getCallSignatures();
		if (signatures.length > 0) {
			// Keep the signature string so docs can show `(e: MouseEvent) => void`
			// instead of a bare `function`.
			return { kind: "function", raw: typeString };
		}

		if (
			(typeString.includes("ReactNode") ||
				typeString.includes("ReactElement")) &&
			!typeString.endsWith("[]")
		) {
			return { kind: "node" };
		}

		return { kind: "unknown", raw: typeString };
	}

	async notifyChange(changedFiles: string[] = []): Promise<void> {
		if (!this.service) {
			await this.start();
			return;
		}
		this.markChanged(changedFiles);
		this.refreshProgram();
	}

	/**
	 * Record changed files for the next program refresh by bumping their versions. The bump makes
	 * the service re-read the file's snapshot (without it the cached AST is reused → stale
	 * extraction); for a not-yet-seen file the same bump adds it to the root set, so a brand-new
	 * file that nothing imports yet still enters the program. Non-TS changes (e.g. `.css`) are ignored.
	 */
	private markChanged(files: string[]): void {
		for (const f of files) {
			if (!TS_SOURCE_EXT.test(f)) continue;
			const abs = resolve(this.cwd, f);
			this.fileVersions.set(abs, (this.fileVersions.get(abs) ?? 0) + 1);
		}
	}
}

/** Extensions TypeScript will accept as program root files. */
const TS_SOURCE_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

/** The identifier node naming a declaration (function/class/variable), or null. */
function declarationNameNode(decl: ts.Declaration): ts.Node | null {
	const name = (decl as { name?: ts.Node }).name;
	return name && ts.isIdentifier(name) ? name : null;
}

/** Whether a signature return type looks like a rendered React node (function-component check). */
function isReactReturnType(checker: ts.TypeChecker, type: ts.Type): boolean {
	const s = checker.typeToString(type);
	return /\b(ReactElement|ReactNode|ReactPortal|JSX\.Element|Element)\b/.test(
		s,
	);
}

/** Read a symbol's `@remarks` JSDoc tag (usage guidance / do-don't), or "" when absent. */
function getSymbolRemarks(checker: ts.TypeChecker, symbol: ts.Symbol): string {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (tag.name === "remarks") return ts.displayPartsToString(tag.text).trim();
	}
	return "";
}

/**
 * Pull the JSDoc description (the prose before any `@tag` lines) for a symbol.
 * Returns the joined text or an empty string when there is none.
 */
function getSymbolDescription(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string {
	const parts = symbol.getDocumentationComment(checker);
	if (parts.length === 0) return "";
	return ts.displayPartsToString(parts).trim();
}

/**
 * Read a prop's `@default` (or `@defaultValue`) JSDoc tag, or "" when absent. Unlike a
 * parameter-destructuring default, a JSDoc tag is preserved in emitted `.d.ts`, so it's
 * the way to surface a default for a component documented from a built package.
 */
function getSymbolDefaultTag(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (tag.name === "default" || tag.name === "defaultValue") {
			return ts.displayPartsToString(tag.text).trim();
		}
	}
	return "";
}

/**
 * Read a prop's `@deprecated` JSDoc tag. Returns the tag's text (a replacement /
 * migration note) when present, `true` for a bare `@deprecated`, or `undefined`
 * when the prop carries no such tag. Like other JSDoc tags it survives into
 * emitted `.d.ts`, so it works for components documented from a built package.
 */
function getSymbolDeprecation(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string | true | undefined {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (tag.name === "deprecated") {
			return ts.displayPartsToString(tag.text).trim() || true;
		}
	}
	return undefined;
}

/**
 * Given a declaration node (FunctionDeclaration, VariableDeclaration with a
 * function/arrow initializer, etc.), return the function-like node whose
 * parameters we want to inspect, or null if no such node is found.
 */
function resolveFunctionLikeFromDeclaration(
	decl: ts.Declaration,
): ts.SignatureDeclaration | null {
	if (
		ts.isFunctionDeclaration(decl) ||
		ts.isFunctionExpression(decl) ||
		ts.isArrowFunction(decl)
	) {
		return decl;
	}

	if (ts.isVariableDeclaration(decl) && decl.initializer) {
		const init = decl.initializer;
		if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
			return init;
		}
	}

	return null;
}

/**
 * Walk an ObjectBindingPattern and record `{ propName → initializerText }` for
 * each binding element that has a default. Nested bindings and array patterns
 * are skipped — only the top-level destructured props are captured.
 */
function collectDefaultPropsFromBindingName(
	name: ts.BindingName,
	out: Map<string, string>,
): void {
	if (!ts.isObjectBindingPattern(name)) return;

	for (const element of name.elements) {
		if (!element.initializer) continue;
		const propName = element.propertyName ?? element.name;
		if (!ts.isIdentifier(propName)) continue;
		out.set(propName.text, element.initializer.getText());
	}
}
