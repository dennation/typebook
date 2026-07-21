import { resolve } from "node:path";
import ts from "typescript";
import type { ComponentInfo } from "../types";
import { extractComponentInfo } from "./extractComponentInfo";
import { functionLikeOf } from "./paramDefaults";
import { dedent } from "./source-slice";

/** Extensions TypeScript will accept as program root files. */
const TS_SOURCE_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

/** A function source resolved from a `<Snippet source={ref}>` reference. */
export interface SnippetSource {
	/** The function body, sliced 1:1 then dedented — the text shown as the snippet. */
	source: string;
	/** Absolute path of the file the reference resolved to (registered as a watch dependency). */
	file: string;
}

/**
 * Owns one warm TypeScript LanguageService/program and exposes
 * {@link TypeScriptClient.getExportedComponentInfos} — a file's exported components, by type. All
 * per-node extraction lives in sibling modules; this class only manages the program's lifecycle.
 */
export class TypeScriptClient {
	private service: ts.LanguageService | null = null;
	private program: ts.Program | null = null;
	private checker: ts.TypeChecker | null = null;

	/** tsconfig compiler options — read once. */
	private options: ts.CompilerOptions | null = null;
	// The program's root files mapped to their versions. Backs the LanguageServiceHost: bumping a
	// file's version tells the service its snapshot changed, so it re-reads and reparses only that one.
	private readonly fileVersions = new Map<string, number>();
	// In-memory content overlays keyed by absolute path. A `transform` hook resolves a snippet
	// against the module's *current* (possibly already-rewritten) `code`, not what's on disk — so
	// the overlay is applied as the file's snapshot while the reference is resolved.
	private readonly overrides = new Map<string, string>();

	constructor(private cwd: string) {}

	async start(): Promise<void> {
		if (!this.options) {
			const configPath = ts.findConfigFile(
				this.cwd,
				ts.sys.fileExists,
				"tsconfig.json",
			);
			if (!configPath) throw new Error("tsconfig.json not found");

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
		this.overrides.clear();
	}

	/**
	 * Every exported React component in a file — the scan surface for `components`-configured files.
	 * Each export is inspected by type; the ones that are function components (a call signature
	 * returning a React node) yield a doc.
	 */
	async getExportedComponentInfos(filePath: string): Promise<ComponentInfo[]> {
		if (!this.program || !this.checker) await this.start();

		const absPath = resolve(this.cwd, filePath);
		const sourceFile = this.ensureSourceFile(absPath);
		const checker = this.checker;
		if (!sourceFile || !checker) return [];

		const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
		if (!moduleSymbol) return [];

		const docs: ComponentInfo[] = [];
		for (const exp of checker.getExportsOfModule(moduleSymbol)) {
			const doc = extractComponentInfo(checker, exp, sourceFile.fileName);
			if (doc) docs.push(doc);
		}
		return docs;
	}

	/**
	 * Resolve a `<Snippet source={ref}>` reference to the body source of the function it names.
	 * `identifierOffset` is the character offset of the `ref` identifier (in `content`/`filePath`).
	 * The symbol is resolved through the warm program — following an import alias into another file —
	 * to its declaration; if that declaration is (or initializes to) a function, its body is sliced
	 * exactly as the inline scanner would. Returns the sliced source plus the file it came from (so
	 * the caller can register a watch dependency), or `null` when the reference can't be resolved to
	 * a function literal.
	 */
	async getSnippetSource(
		filePath: string,
		identifierOffset: number,
		content?: string,
	): Promise<SnippetSource | null> {
		if (!this.program || !this.checker) await this.start();

		const absPath = resolve(this.cwd, filePath);
		if (content !== undefined) this.setOverride(absPath, content);

		const sourceFile = this.program?.getSourceFile(absPath);
		const checker = this.checker;
		if (!sourceFile || !checker) return null;

		const ident = findIdentifierAt(sourceFile, identifierOffset);
		if (!ident) return null;

		const symbol = checker.getSymbolAtLocation(ident);
		if (!symbol) return null;
		const resolved =
			symbol.flags & ts.SymbolFlags.Alias
				? checker.getAliasedSymbol(symbol)
				: symbol;

		for (const decl of resolved.getDeclarations() ?? []) {
			const fn = functionLikeOf(decl);
			const source = fn && sliceFunctionBody(fn);
			if (source != null) {
				return { source, file: decl.getSourceFile().fileName };
			}
		}
		return null;
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

	/** Re-read the given changed files on the next refresh, then refresh the warm program. */
	async notifyChange(changedFiles: string[] = []): Promise<void> {
		if (!this.service) {
			await this.start();
			return;
		}
		this.markChanged(changedFiles);
		this.refreshProgram();
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

	/**
	 * The source file for `absPath`, adding it as a program root first if the tsconfig didn't already
	 * include it. A `components` glob can match files outside the tsconfig `include`; without this they
	 * would silently yield no components. Returns undefined only when the file can't be read.
	 */
	private ensureSourceFile(absPath: string): ts.SourceFile | undefined {
		const existing = this.program?.getSourceFile(absPath);
		if (existing) return existing;
		if (this.fileVersions.has(absPath)) return undefined; // already a root but unreadable/non-existent
		this.fileVersions.set(absPath, 0);
		this.refreshProgram();
		return this.program?.getSourceFile(absPath);
	}

	/** Pull the latest warm program from the service. */
	private refreshProgram(): void {
		this.program = this.service?.getProgram() ?? null;
		this.checker = this.program?.getTypeChecker() ?? null;
	}

	/**
	 * Bump changed files' versions so the service re-reads their snapshots (otherwise the cached AST
	 * is reused → stale extraction); the same bump adds a brand-new file to the root set. Non-TS
	 * changes (e.g. `.css`) are ignored.
	 */
	private markChanged(files: string[]): void {
		for (const f of files) {
			if (!TS_SOURCE_EXT.test(f)) continue;
			const abs = resolve(this.cwd, f);
			this.fileVersions.set(abs, (this.fileVersions.get(abs) ?? 0) + 1);
		}
	}
}

/** Find the Identifier node that starts exactly at `offset` (matching the scanner's oxc offset). */
function findIdentifierAt(
	sourceFile: ts.SourceFile,
	offset: number,
): ts.Identifier | null {
	let found: ts.Identifier | null = null;
	const visit = (node: ts.Node): void => {
		if (found) return;
		if (ts.isIdentifier(node) && node.getStart(sourceFile) === offset) {
			found = node;
			return;
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);
	return found;
}

/**
 * Slice a function-like declaration's body, mirroring the inline scanner: a block body yields its
 * statements (braces stripped); an expression body yields the expression (parens unwrapped). Read
 * from the declaration's own source file, so a cross-module reference shows that file's text.
 * Returns null when the node has no body (e.g. an overload signature).
 */
function sliceFunctionBody(fn: ts.SignatureDeclaration): string | null {
	const body = (fn as ts.FunctionLikeDeclaration).body;
	if (!body) return null;

	const text = fn.getSourceFile().text;

	if (ts.isBlock(body)) {
		// Strip the wrapping braces, keep the statements (incl. `return`).
		return dedent(text.slice(body.getStart() + 1, body.getEnd() - 1));
	}

	// Expression body: unwrap `() => ( … )` parens so the shown source is just the expression.
	let expr: ts.Expression = body;
	while (ts.isParenthesizedExpression(expr)) expr = expr.expression;
	return dedent(text.slice(expr.getStart(), expr.getEnd()));
}
