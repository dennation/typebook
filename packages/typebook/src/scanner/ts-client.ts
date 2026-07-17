import { resolve } from "node:path";
import ts from "typescript";
import type { ComponentInfo } from "../types";
import { extractComponentInfo } from "./extractComponentInfo";

/** Extensions TypeScript will accept as program root files. */
const TS_SOURCE_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

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
