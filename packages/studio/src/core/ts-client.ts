import ts from 'typescript'
import { resolve } from 'node:path'
import type { PropInfo, PropType } from '../types.js'
import { LOG_PREFIX } from '../constants.js'

export class TypeScriptClient {
  private program: ts.Program | null = null
  private checker: ts.TypeChecker | null = null

  // Cached tsconfig — read once, reuse across rebuilds
  private cachedFileNames: string[] | null = null
  private cachedOptions: ts.CompilerOptions | null = null

  constructor(private cwd: string) {}

  async start(): Promise<void> {
    if (!this.cachedFileNames || !this.cachedOptions) {
      const configPath = ts.findConfigFile(this.cwd, ts.sys.fileExists, 'tsconfig.json')
      if (!configPath) {
        throw new Error('tsconfig.json not found')
      }

      const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
      const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd)
      this.cachedFileNames = fileNames
      this.cachedOptions = options
    }

    // Pass oldProgram so TS reuses unchanged source files
    this.program = ts.createProgram(
      this.cachedFileNames,
      this.cachedOptions,
      undefined,
      this.program ?? undefined,
    )
    this.checker = this.program.getTypeChecker()
  }

  stop(): void {
    this.program = null
    this.checker = null
    this.cachedFileNames = null
    this.cachedOptions = null
  }

  async getComponentProps(filePath: string): Promise<PropInfo[] | null> {
    if (!this.program || !this.checker) {
      await this.start()
    }

    if (!this.program || !this.checker) {
      console.warn(LOG_PREFIX, 'TypeScript program not initialized')
      return null
    }

    const absPath = resolve(this.cwd, filePath)

    // Find the source file
    const sourceFile = this.program.getSourceFile(absPath)
    if (!sourceFile) {
      console.warn(LOG_PREFIX, 'Could not get source file:', absPath)
      return null
    }

    // Find the variable declaration: const button = describe(Button, ...) or define(Button, ...)
    // The type of 'button' is DefineResult<Pick<Props, IncludedProps>>
    // So TypeScript already filtered props for us!
    return this.findComponentPropsInFile(sourceFile)
  }

  private findComponentPropsInFile(sourceFile: ts.SourceFile): PropInfo[] | null {
    // Guaranteed non-null by getComponentProps guard
    const checker = this.checker!
    let result: PropInfo[] | null = null
    const defineFnNames = new Set(['define', 'describe'])

    const visit = (node: ts.Node): void => {
      // Look for: const button = define(...) or describe(...)
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (!decl.initializer || !ts.isCallExpression(decl.initializer)) continue

          const callExpr = decl.initializer
          if (!ts.isIdentifier(callExpr.expression) || !defineFnNames.has(callExpr.expression.text)) continue

          // Found define()/describe() call
          if (!ts.isIdentifier(decl.name)) continue

          // Get type of the entire call expression: define(Button, {...})
          // This gives us the instantiated DefineResult<Props>
          const defineResultType = checker.getTypeAtLocation(callExpr)

          // DefineResult<Props> is a type reference — cast needed because
          // TS checker returns ts.Type but DefineResult<T> is always a reference
          const typeRef = defineResultType as ts.TypeReference

          // First try: typeArguments property on TypeReference
          if (typeRef.typeArguments && typeRef.typeArguments.length > 0) {
            const propsType = typeRef.typeArguments[0]
            result = this.extractPropsFromType(checker, propsType)
            return
          }

          // Second try: getTypeArguments method
          const typeArgs = checker.getTypeArguments(typeRef)
          if (typeArgs && typeArgs.length > 0) {
            const propsType = typeArgs[0]
            result = this.extractPropsFromType(checker, propsType)
            return
          }

          console.warn(LOG_PREFIX, 'Could not extract Props type argument')
          return
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return result
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

      props.push({
        name: propName,
        optional: isOptional,
        type: typeInfo,
      })
    }

    return props
  }

  private convertTsType(checker: ts.TypeChecker, type: ts.Type): PropType {
    const typeString = checker.typeToString(type)
    const flags = type.flags

    // Check for 'any' type - skip it
    if (flags & ts.TypeFlags.Any) {
      return { kind: 'unknown', raw: 'any' }
    }

    // Union type
    if (type.isUnion()) {
      const types = type.types.filter(t => !(t.flags & ts.TypeFlags.Undefined) && !(t.flags & ts.TypeFlags.Null))

      // If only one type left after filtering undefined/null, unwrap it
      if (types.length === 1) {
        return this.convertTsType(checker, types[0])
      }

      // String literal union: "sm" | "md" | "lg"
      if (types.every(t => t.flags & ts.TypeFlags.StringLiteral)) {
        const values = types.map(t => (t as ts.StringLiteralType).value)
        return { kind: 'literal', values }
      }

      // Boolean (true | false)
      if (types.every(t => t.flags & ts.TypeFlags.BooleanLiteral)) {
        return { kind: 'boolean' }
      }

      // Number literal union: 1 | 2 | 3
      if (types.every(t => t.flags & ts.TypeFlags.NumberLiteral)) {
        return { kind: 'number' }
      }
    }

    // Primitives
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

    // Function
    const signatures = type.getCallSignatures()
    if (signatures.length > 0) {
      return { kind: 'function' }
    }

    // Object/React Node
    if (typeString.includes('ReactNode') || typeString.includes('ReactElement')) {
      return { kind: 'node' }
    }

    return { kind: 'unknown', raw: typeString }
  }

  async notifyChange(_filePath: string): Promise<void> {
    // Incremental rebuild: reuses old program so TS only re-parses changed files
    await this.start()
  }
}
