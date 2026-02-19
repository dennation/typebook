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

    const absPath = resolve(this.cwd, filePath)

    // Find the source file
    const sourceFile = this.program!.getSourceFile(absPath)
    if (!sourceFile) {
      console.log(LOG_PREFIX, 'Could not get source file')
      return null
    }

    // Find the variable declaration: const button = define(Button, ...)
    // The type of 'button' is DefineResult<Pick<Props, IncludedProps>>
    // So TypeScript already filtered props for us!
    const props = this.findComponentPropsInFile(sourceFile)

    if (props) {
      console.log(LOG_PREFIX, 'Extracted', props.length, 'props from DefineResult type')
    }

    return props
  }

  private findComponentPropsInFile(sourceFile: ts.SourceFile): PropInfo[] | null {
    let result: PropInfo[] | null = null

    const visit = (node: ts.Node): void => {
      // Look for: const button = define(...)
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (!decl.initializer || !ts.isCallExpression(decl.initializer)) continue

          const callExpr = decl.initializer
          if (!ts.isIdentifier(callExpr.expression) || callExpr.expression.text !== 'define') continue

          // Found define(...) call
          if (!ts.isIdentifier(decl.name)) continue

          const varName = decl.name.text
          console.log(LOG_PREFIX, 'Found define() variable:', varName)

          // Get type of the entire call expression: define(Button, {...})
          // This gives us the instantiated DefineResult<Props>
          const defineResultType = this.checker!.getTypeAtLocation(callExpr)

          console.log(LOG_PREFIX, 'defineResultType:', this.checker!.typeToString(defineResultType))

          // DefineResult<Props> is a type reference with type arguments
          const typeRef = defineResultType as ts.TypeReference

          // First try: typeArguments property on TypeReference
          if (typeRef.typeArguments && typeRef.typeArguments.length > 0) {
            const propsType = typeRef.typeArguments[0]
            console.log(LOG_PREFIX, 'Got Props from typeRef.typeArguments:', this.checker!.typeToString(propsType))
            result = this.extractPropsFromType(propsType)
            return
          }

          // Second try: getTypeArguments method
          const typeArgs = this.checker!.getTypeArguments(typeRef)
          if (typeArgs && typeArgs.length > 0) {
            const propsType = typeArgs[0]
            console.log(LOG_PREFIX, 'Got Props from getTypeArguments:', this.checker!.typeToString(propsType))
            result = this.extractPropsFromType(propsType)
            return
          }

          console.log(LOG_PREFIX, 'Could not extract Props type argument')
          return
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return result
  }

  private extractPropsFromType(type: ts.Type): PropInfo[] {
    const props: PropInfo[] = []
    const properties = type.getProperties()

    console.log(LOG_PREFIX, 'Extracting', properties.length, 'properties')

    for (const prop of properties) {
      const propName = prop.getName()

      // For Pick<T, K> types, we need to get the type directly from the symbol
      // instead of from declarations (which don't exist for mapped types)
      const propType = this.checker!.getTypeOfSymbol(prop)
      const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0

      console.log(LOG_PREFIX, 'Property:', propName, 'type:', this.checker!.typeToString(propType), 'optional:', isOptional)

      const typeInfo = this.convertTsType(propType)

      props.push({
        name: propName,
        optional: isOptional,
        type: typeInfo,
      })
    }

    return props
  }

  private convertTsType(type: ts.Type): PropType {
    const typeString = this.checker!.typeToString(type)
    const flags = type.flags

    console.log(LOG_PREFIX, 'Converting type:', typeString, 'flags:', flags)

    // Check for 'any' type - skip it
    if (flags & ts.TypeFlags.Any) {
      console.log(LOG_PREFIX, 'Type is any, returning unknown')
      return { kind: 'unknown', raw: 'any' }
    }

    // Union type
    if (type.isUnion()) {
      const types = type.types.filter(t => !(t.flags & ts.TypeFlags.Undefined) && !(t.flags & ts.TypeFlags.Null))

      // If only one type left after filtering undefined/null, unwrap it
      if (types.length === 1) {
        return this.convertTsType(types[0])
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

  /**
   * Extract per-part props from a compound component story file.
   * Finds defineCompound() call and extracts the PartsProps type argument,
   * then iterates over its properties to get PropInfo[] per part.
   */
  async getCompoundPartProps(filePath: string): Promise<Record<string, PropInfo[]> | null> {
    if (!this.program || !this.checker) {
      await this.start()
    }

    const absPath = resolve(this.cwd, filePath)
    const sourceFile = this.program!.getSourceFile(absPath)
    if (!sourceFile) {
      console.log(LOG_PREFIX, 'Could not get source file for compound')
      return null
    }

    const result = this.findCompoundPropsInFile(sourceFile)
    if (result) {
      const partNames = Object.keys(result)
      const totalProps = partNames.reduce((sum, k) => sum + result[k].length, 0)
      console.log(LOG_PREFIX, 'Extracted', totalProps, 'props across', partNames.length, 'parts from CompoundDefineResult')
    }

    return result
  }

  private findCompoundPropsInFile(sourceFile: ts.SourceFile): Record<string, PropInfo[]> | null {
    let result: Record<string, PropInfo[]> | null = null

    const visit = (node: ts.Node): void => {
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (!decl.initializer || !ts.isCallExpression(decl.initializer)) continue

          const callExpr = decl.initializer
          if (!ts.isIdentifier(callExpr.expression) || callExpr.expression.text !== 'defineCompound') continue

          if (!ts.isIdentifier(decl.name)) continue

          const varName = decl.name.text
          console.log(LOG_PREFIX, 'Found defineCompound() variable:', varName)

          // Get type of defineCompound(...) → CompoundDefineResult<PartsProps>
          const compoundResultType = this.checker!.getTypeAtLocation(callExpr)
          console.log(LOG_PREFIX, 'compoundResultType:', this.checker!.typeToString(compoundResultType))

          const typeRef = compoundResultType as ts.TypeReference

          // Extract PartsProps type argument (first type param)
          let partsPropsType: ts.Type | null = null

          if (typeRef.typeArguments && typeRef.typeArguments.length > 0) {
            partsPropsType = typeRef.typeArguments[0]
          } else {
            const typeArgs = this.checker!.getTypeArguments(typeRef)
            if (typeArgs && typeArgs.length > 0) {
              partsPropsType = typeArgs[0]
            }
          }

          if (!partsPropsType) {
            console.log(LOG_PREFIX, 'Could not extract PartsProps type argument')
            return
          }

          console.log(LOG_PREFIX, 'PartsProps type:', this.checker!.typeToString(partsPropsType))

          // PartsProps is { root: RootProps, trigger: TriggerProps, ... }
          // Iterate over each property (part) and extract PropInfo[]
          result = {}
          const partProperties = partsPropsType.getProperties()

          for (const partSymbol of partProperties) {
            const partName = partSymbol.getName()
            const partType = this.checker!.getTypeOfSymbol(partSymbol)
            console.log(LOG_PREFIX, 'Extracting props for part:', partName, 'type:', this.checker!.typeToString(partType))
            result[partName] = this.extractPropsFromType(partType)
          }

          return
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return result
  }

  async notifyChange(_filePath: string): Promise<void> {
    // Incremental rebuild: reuses old program so TS only re-parses changed files
    await this.start()
  }
}
