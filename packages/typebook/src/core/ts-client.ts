import ts from 'typescript'
import { resolve } from 'node:path'
import type { PropInfo, PropType } from '../types.js'
import { LOG_PREFIX, DEFAULT_INHERITED_PROVIDERS } from '../constants.js'

export class TypeScriptClient {
  private service: ts.LanguageService | null = null
  /** Thin builder over the warm program, only for the dependency graph (rebuilt on change). */
  private depBuilder: ts.SemanticDiagnosticsBuilderProgram | null = null
  private program: ts.Program | null = null
  private checker: ts.TypeChecker | null = null

  // tsconfig compiler options — read once.
  private options: ts.CompilerOptions | null = null
  // Live root file set + per-file version backing the LanguageServiceHost. Bumping a file's
  // version tells the service its snapshot changed; adding a name brings a new file in.
  private readonly fileNames: string[] = []
  private readonly versions = new Map<string, number>()

  private readonly inheritedPaths: string[]

  constructor(private cwd: string, inheritedProviders?: string[]) {
    const userPaths = (inheritedProviders ?? []).map(
      (pkg) => `/node_modules/${pkg}/`,
    )
    this.inheritedPaths = [...DEFAULT_INHERITED_PROVIDERS, ...userPaths]
  }

  async start(): Promise<void> {
    if (!this.options) {
      const configPath = ts.findConfigFile(this.cwd, ts.sys.fileExists, 'tsconfig.json')
      if (!configPath) {
        throw new Error('tsconfig.json not found')
      }

      const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
      const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd)
      this.options = options
      for (const f of fileNames) {
        this.fileNames.push(f)
        this.versions.set(f, 0)
      }
    }

    if (!this.service) {
      // A LanguageService keeps ONE program warm across edits (the model tsserver/editors use):
      // the default lib and node_modules `.d.ts` are parsed once and reused via the
      // DocumentRegistry, so an incremental rebuild reparses only the files whose version we
      // bumped — orders of magnitude cheaper than recreating the whole program on each change.
      this.service = ts.createLanguageService(this.createHost(), ts.createDocumentRegistry())
    }

    this.refreshProgram()
  }

  stop(): void {
    this.service?.dispose()
    this.service = null
    this.depBuilder = null
    this.program = null
    this.checker = null
    this.options = null
    this.fileNames.length = 0
    this.versions.clear()
  }

  private createHost(): ts.LanguageServiceHost {
    return {
      getScriptFileNames: () => this.fileNames,
      getScriptVersion: (f) => String(this.versions.get(f) ?? 0),
      getScriptSnapshot: (f) => {
        const text = ts.sys.readFile(f)
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text)
      },
      getCurrentDirectory: () => this.cwd,
      getCompilationSettings: () => this.options ?? {},
      getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    }
  }

  /** Pull the latest warm program from the service and drop the now-stale dependency builder. */
  private refreshProgram(): void {
    this.program = this.service?.getProgram() ?? null
    this.checker = this.program?.getTypeChecker() ?? null
    this.depBuilder = null
  }

  /**
   * Files the given file transitively depends on, per TypeScript's own file reference graph.
   * Lets the caller re-resolve only the registrations a change can actually reach, instead of
   * re-extracting every registration on every edit. Returns null when the program isn't
   * available or the file isn't part of it (caller falls back to a full refresh).
   */
  getDependencies(filePath: string): readonly string[] | null {
    if (!this.program) return null
    const sourceFile = this.program.getSourceFile(resolve(this.cwd, filePath))
    if (!sourceFile) return null
    if (!this.depBuilder) {
      // Thin builder *over the existing warm program* — builds only the reference graph, with no
      // re-parse or re-check. Rebuilt lazily whenever the program changes (see refreshProgram).
      this.depBuilder = ts.createSemanticDiagnosticsBuilderProgram(this.program, {})
    }
    return this.depBuilder.getAllDependencies(sourceFile)
  }

  /**
   * Extract props for a single `define(Component, ...)` call located at `callStart`
   * (character offset in the source).
   */
  async getRegisterProps(filePath: string, callStart: number): Promise<PropInfo[] | null> {
    if (!this.program || !this.checker) {
      await this.start()
    }

    const absPath = resolve(this.cwd, filePath)
    const sourceFile = this.program?.getSourceFile(absPath)
    if (!sourceFile) {
      console.warn(LOG_PREFIX, 'Could not get source file:', absPath)
      return null
    }

    const callExpr = this.findRegisterCallAt(sourceFile, callStart)
    if (!callExpr) {
      console.warn(LOG_PREFIX, `No registerComponent() call at offset ${callStart} in ${filePath}`)
      return null
    }

    return this.extractPropsFromRegisterCall(callExpr)
  }

  /**
   * Locate the `register(...)` CallExpression that starts at the given character offset.
   */
  private findRegisterCallAt(sourceFile: ts.SourceFile, callStart: number): ts.CallExpression | null {
    let found: ts.CallExpression | null = null
    const visit = (node: ts.Node): void => {
      if (found) return
      // The scanner already validated this is a registerComponent() call (resolving any
      // import alias such as `import { registerComponent as reg }`). `callStart` uniquely
      // pins the exact CallExpression, so match on the offset rather than re-checking the
      // callee name — a name check here would silently reject aliased calls and drop their props.
      if (ts.isCallExpression(node) && node.getStart(sourceFile) === callStart) {
        found = node
        return
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return found
  }

  private extractPropsFromRegisterCall(callExpr: ts.CallExpression): PropInfo[] | null {
    const checker = this.checker
    if (!checker) return null

    const defineResultType = checker.getTypeAtLocation(callExpr)
    const typeRef = defineResultType as ts.TypeReference

    let props: PropInfo[] | null = null
    if (typeRef.typeArguments && typeRef.typeArguments.length > 0) {
      props = this.extractPropsFromType(checker, typeRef.typeArguments[0])
    } else {
      const typeArgs = checker.getTypeArguments(typeRef)
      if (typeArgs && typeArgs.length > 0) {
        props = this.extractPropsFromType(checker, typeArgs[0])
      }
    }

    if (!props) {
      console.warn(LOG_PREFIX, 'Could not extract Props type argument')
      return null
    }

    const componentArg = callExpr.arguments[1]
    if (!componentArg) return props

    const inheritedNames = this.getInheritedPropNames(checker, componentArg)
    const paramDefaultProps = this.getParamDefaultProps(checker, componentArg)
    return props.map((p) => {
      let next: PropInfo = p
      if (inheritedNames.has(p.name)) {
        next = { ...next, inherited: true }
      }
      const def = paramDefaultProps.get(p.name)
      if (def !== undefined) {
        next = { ...next, defaultValue: def }
      }
      return next
    })
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
    const defaultProps = new Map<string, string>()

    const symbol = checker.getSymbolAtLocation(componentNode)
    if (!symbol) return defaultProps

    const aliasedSymbol = symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol
    const declarations = aliasedSymbol.getDeclarations()
    if (!declarations || declarations.length === 0) return defaultProps

    for (const decl of declarations) {
      const fn = resolveFunctionLikeFromDeclaration(decl)
      if (!fn) continue

      const firstParam = fn.parameters[0]
      if (!firstParam) continue

      collectDefaultPropsFromBindingName(firstParam.name, defaultProps)
      if (defaultProps.size > 0) break
    }

    return defaultProps
  }

  /**
   * Get the original Props type from a component and classify each property
   * as inherited (all declarations in framework paths) or own.
   */
  private getInheritedPropNames(
    checker: ts.TypeChecker,
    componentNode: ts.Node,
  ): Set<string> {
    const inherited = new Set<string>()

    const componentType = checker.getTypeAtLocation(componentNode)
    const signatures = [
      ...componentType.getCallSignatures(),
      ...componentType.getConstructSignatures(),
    ]

    if (signatures.length === 0) return inherited

    const firstSig = signatures[0]
    const params = firstSig.getParameters()
    if (params.length === 0) return inherited

    const propsParam = params[0]
    const propsType = checker.getTypeOfSymbol(propsParam)

    for (const prop of propsType.getProperties()) {
      if (this.isInheritedProp(prop)) {
        inherited.add(prop.getName())
      }
    }

    return inherited
  }

  /**
   * A prop is inherited if ALL its declarations come from excluded type packages.
   * Props with no declarations (synthetic) are considered own.
   */
  private isInheritedProp(symbol: ts.Symbol): boolean {
    const declarations = symbol.getDeclarations()
    if (!declarations || declarations.length === 0) return false

    return declarations.every((decl) => {
      const fileName = decl.getSourceFile().fileName
      return this.inheritedPaths.some((p) => fileName.includes(p))
    })
  }

  private extractPropsFromType(checker: ts.TypeChecker, type: ts.Type): PropInfo[] {
    const props: PropInfo[] = []
    const properties = type.getProperties()

    for (const prop of properties) {
      const propName = prop.getName()

      // For Pick<T, K> types, we need to get the type directly from the symbol
      // instead of from declarations (which don't exist for mapped types)
      const propType = checker.getTypeOfSymbol(prop)
      const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0
      const typeInfo = this.convertTsType(checker, propType)
      const description = getSymbolDescription(checker, prop)

      const info: PropInfo = {
        name: propName,
        optional: isOptional,
        type: typeInfo,
      }
      if (description) info.description = description

      props.push(info)
    }

    return props
  }

  private convertTsType(checker: ts.TypeChecker, type: ts.Type): PropType {
    const typeString = checker.typeToString(type)
    const flags = type.flags

    if (flags & ts.TypeFlags.Any) {
      return { kind: 'unknown', raw: 'any' }
    }

    if (type.isUnion()) {
      const types = type.types.filter(t => !(t.flags & ts.TypeFlags.Undefined) && !(t.flags & ts.TypeFlags.Null))

      if (types.length === 1) {
        return this.convertTsType(checker, types[0])
      }

      if (types.every(t => t.flags & ts.TypeFlags.StringLiteral)) {
        const values = types.map(t => (t as ts.StringLiteralType).value)
        return { kind: 'literal', values }
      }

      if (types.every(t => t.flags & ts.TypeFlags.BooleanLiteral)) {
        return { kind: 'boolean' }
      }

      if (types.every(t => t.flags & ts.TypeFlags.NumberLiteral)) {
        return { kind: 'number' }
      }
    }

    if (type.flags & ts.TypeFlags.Boolean || type.flags & ts.TypeFlags.BooleanLiteral) {
      return { kind: 'boolean' }
    }

    if (type.flags & ts.TypeFlags.String || type.flags & ts.TypeFlags.StringLiteral) {
      if (type.flags & ts.TypeFlags.StringLiteral) {
        return { kind: 'literal', values: [(type as ts.StringLiteralType).value] }
      }
      return { kind: 'string' }
    }

    if (type.flags & ts.TypeFlags.Number || type.flags & ts.TypeFlags.NumberLiteral) {
      return { kind: 'number' }
    }

    const signatures = type.getCallSignatures()
    if (signatures.length > 0) {
      return { kind: 'function' }
    }

    if (typeString.includes('ReactNode') || typeString.includes('ReactElement')) {
      return { kind: 'node' }
    }

    return { kind: 'unknown', raw: typeString }
  }

  async notifyChange(changedFiles: string[] = []): Promise<void> {
    if (!this.service) {
      await this.start()
      return
    }
    this.addRootFiles(changedFiles)
    // Bump the version of each changed file so the service re-reads its snapshot; without the
    // bump it would reuse the cached AST and extraction would go stale.
    for (const f of changedFiles) {
      const abs = resolve(this.cwd, f)
      const current = this.versions.get(abs)
      if (current !== undefined) this.versions.set(abs, current + 1)
    }
    this.refreshProgram()
  }

  /**
   * Bring newly-created source files into the program. The root set seeds from tsconfig once;
   * a brand-new file that nothing imports yet would otherwise never enter the program
   * (`getSourceFile` → undefined) and its registrations would get no props. The service reads
   * `getScriptFileNames` live, so an in-place addition is picked up on the next refresh.
   * Non-TS files (e.g. a changed `.css`) are ignored.
   */
  private addRootFiles(files: string[]): void {
    for (const f of files) {
      if (!TS_SOURCE_EXT.test(f)) continue
      const abs = resolve(this.cwd, f)
      if (!this.versions.has(abs)) {
        this.fileNames.push(abs)
        this.versions.set(abs, 0)
      }
    }
  }
}

/** Extensions TypeScript will accept as program root files. */
const TS_SOURCE_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/

/**
 * Pull the JSDoc description (the prose before any `@tag` lines) for a symbol.
 * Returns the joined text or an empty string when there is none.
 */
function getSymbolDescription(checker: ts.TypeChecker, symbol: ts.Symbol): string {
  const parts = symbol.getDocumentationComment(checker)
  if (parts.length === 0) return ''
  return ts.displayPartsToString(parts).trim()
}

/**
 * Given a declaration node (FunctionDeclaration, VariableDeclaration with a
 * function/arrow initializer, etc.), return the function-like node whose
 * parameters we want to inspect, or null if no such node is found.
 */
function resolveFunctionLikeFromDeclaration(decl: ts.Declaration): ts.SignatureDeclaration | null {
  if (ts.isFunctionDeclaration(decl) || ts.isFunctionExpression(decl) || ts.isArrowFunction(decl)) {
    return decl
  }

  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    const init = decl.initializer
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
      return init
    }
  }

  return null
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
  if (!ts.isObjectBindingPattern(name)) return

  for (const element of name.elements) {
    if (!element.initializer) continue
    const propName = element.propertyName ?? element.name
    if (!ts.isIdentifier(propName)) continue
    out.set(propName.text, element.initializer.getText())
  }
}
