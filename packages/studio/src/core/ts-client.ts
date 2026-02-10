import ts from 'typescript'
import { resolve } from 'node:path'
import type { PropInfo, PropType } from '../types.js'

export class TypeScriptClient {
  private program: ts.Program | null = null
  private checker: ts.TypeChecker | null = null

  constructor(private cwd: string) {}

  async start(): Promise<void> {
    const configPath = ts.findConfigFile(this.cwd, ts.sys.fileExists, 'tsconfig.json')
    if (!configPath) {
      throw new Error('tsconfig.json not found')
    }

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
    const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd)

    this.program = ts.createProgram(fileNames, options)
    this.checker = this.program.getTypeChecker()
  }

  stop(): void {
    this.program = null
    this.checker = null
  }

  async getComponentProps(filePath: string): Promise<PropInfo[] | null> {
    if (!this.program || !this.checker) {
      await this.start()
    }

    const absPath = resolve(this.cwd, filePath)

    // Find the source file
    const sourceFile = this.program!.getSourceFile(absPath)
    if (!sourceFile) {
      console.log('[studio] Could not get source file')
      return null
    }

    // Find the variable declaration: const button = define(Button, ...)
    // The type of 'button' is DefineResult<Pick<Props, IncludedProps>>
    // So TypeScript already filtered props for us!
    const props = this.findComponentPropsInFile(sourceFile)

    if (props) {
      console.log('[studio] Extracted', props.length, 'props from DefineResult type')
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
          console.log('[studio] Found define() variable:', varName)

          // Get type of the entire call expression: define(Button, {...})
          // This gives us the instantiated DefineResult<Props>
          const defineResultType = this.checker!.getTypeAtLocation(callExpr)

          console.log('[studio] defineResultType:', this.checker!.typeToString(defineResultType))

          // DefineResult<Props> is a type reference with type arguments
          const typeRef = defineResultType as ts.TypeReference

          // First try: typeArguments property on TypeReference
          if (typeRef.typeArguments && typeRef.typeArguments.length > 0) {
            const propsType = typeRef.typeArguments[0]
            console.log('[studio] Got Props from typeRef.typeArguments:', this.checker!.typeToString(propsType))
            result = this.extractPropsFromType(propsType)
            return
          }

          // Second try: getTypeArguments method
          const typeArgs = this.checker!.getTypeArguments(typeRef)
          if (typeArgs && typeArgs.length > 0) {
            const propsType = typeArgs[0]
            console.log('[studio] Got Props from getTypeArguments:', this.checker!.typeToString(propsType))
            result = this.extractPropsFromType(propsType)
            return
          }

          console.log('[studio] Could not extract Props type argument')
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

    console.log('[studio] Extracting', properties.length, 'properties')

    for (const prop of properties) {
      const propName = prop.getName()

      // For Pick<T, K> types, we need to get the type directly from the symbol
      // instead of from declarations (which don't exist for mapped types)
      const propType = this.checker!.getTypeOfSymbol(prop)
      const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0

      console.log('[studio] Property:', propName, 'type:', this.checker!.typeToString(propType), 'optional:', isOptional)

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

    console.log('[studio] Converting type:', typeString, 'flags:', flags)

    // Check for 'any' type - skip it
    if (flags & ts.TypeFlags.Any) {
      console.log('[studio] Type is any, returning unknown')
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

  async openFile(filePath: string): Promise<void> {
    // Not needed
  }

  async notifyChange(filePath: string): Promise<void> {
    // Recreate program
    await this.start()
  }
}
