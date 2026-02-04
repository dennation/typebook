import { readFileSync } from 'node:fs'
import type { ParsedPreviewFile, ParsedSetup, ParsedExport, Theme } from '../types.js'

/**
 * Parses a .preview.tsx file to extract:
 * - The default-exported setup() call (component name, import path, config)
 * - Named show() and showVariants() exports
 *
 * Expected file structure:
 *   const x = setup(Component, { defaults: {...} })
 *   export const Foo = x.showVariants('prop')
 *   export default x
 */
export async function parsePreviewFile(
  filePath: string,
): Promise<ParsedPreviewFile> {
  const oxc = await import('oxc-parser')
  const source = readFileSync(filePath, 'utf-8')
  const result = oxc.parseSync(filePath, source)
  const ast: any = result.program

  const setups: ParsedSetup[] = []
  const exports: ParsedExport[] = []

  // Collect imports: name -> source
  const importMap = new Map<string, string>()
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const source = node.source?.value
      if (!source) continue
      for (const spec of node.specifiers ?? []) {
        const localName =
          spec.local?.name ?? spec.imported?.name ?? spec.local?.value
        if (localName) {
          importMap.set(localName, source)
        }
      }
    }
  }

  // Collect all variable declarations: name -> init expression
  const varMap = new Map<string, any>()
  for (const node of ast.body) {
    const varDecl =
      node.type === 'VariableDeclaration'
        ? node
        : node.type === 'ExportNamedDeclaration' &&
            node.declaration?.type === 'VariableDeclaration'
          ? node.declaration
          : null
    if (!varDecl) continue

    for (const decl of varDecl.declarations ?? []) {
      if (decl.id?.name && decl.init) {
        varMap.set(decl.id.name, decl.init)
      }
    }
  }

  // Find export default — should reference the setup() variable
  let setupVarName: string | undefined
  for (const node of ast.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration
      if (decl?.type === 'Identifier') {
        setupVarName = decl.name
      }
      break
    }
  }

  // Resolve the setup() call from the default export variable
  if (setupVarName) {
    const init = varMap.get(setupVarName)
    if (init?.type === 'CallExpression' && init.callee?.name === 'setup') {
      const args = init.arguments ?? []
      if (args.length >= 2) {
        const componentName = args[0]?.name
        if (componentName) {
          const configArg = args[1]
          setups.push({
            componentName,
            importPath: importMap.get(componentName) ?? '',
            variableName: setupVarName,
            defaults: extractObjectLiteral(configArg, 'defaults'),
            layout: extractObjectLiteral(configArg, 'layout') as any,
            theme: extractStringProperty(configArg, 'theme') as Theme | undefined,
          })
        }
      }
    }
  }

  // Find named exports: show() and showVariants() calls
  for (const node of ast.body) {
    if (node.type !== 'ExportNamedDeclaration') continue

    const decl = node.declaration
    if (!decl || decl.type !== 'VariableDeclaration') continue

    for (const varDecl of decl.declarations ?? []) {
      const init = varDecl.init
      if (!init || init.type !== 'CallExpression') continue

      const callee = init.callee
      if (!callee || callee.type !== 'StaticMemberExpression') continue

      const objectName = callee.object?.name
      const methodName = callee.property?.name

      if (!objectName || !methodName) continue
      if (methodName !== 'show' && methodName !== 'showVariants') continue

      const exportName = varDecl.id?.name ?? ''
      const args = init.arguments ?? []

      if (methodName === 'showVariants') {
        const propArg = args[0]
        const propName =
          propArg?.type === 'StringLiteral' ? propArg.value : undefined

        let options: ParsedExport['options']
        if (args[1]) {
          options = {
            props: extractObjectLiteral(args[1], 'props'),
            layout: extractObjectLiteral(args[1], 'layout') as any,
            theme: extractStringProperty(args[1], 'theme') as Theme | undefined,
          }
        }

        exports.push({
          name: exportName,
          kind: 'showVariants',
          setupVariable: objectName,
          prop: propName,
          options,
        })
      } else {
        exports.push({
          name: exportName,
          kind: 'show',
          setupVariable: objectName,
        })
      }
    }
  }

  return { filePath, setups, exports }
}

function extractObjectLiteral(
  node: any,
  propertyName: string,
): Record<string, unknown> {
  if (!node || node.type !== 'ObjectExpression') return {}

  for (const prop of node.properties ?? []) {
    if (prop.type !== 'ObjectProperty') continue
    const key = prop.key?.name ?? prop.key?.value
    if (key !== propertyName) continue

    if (prop.value?.type === 'ObjectExpression') {
      return extractSimpleObject(prop.value)
    }
  }

  return {}
}

function extractStringProperty(
  node: any,
  propertyName: string,
): string | undefined {
  if (!node || node.type !== 'ObjectExpression') return undefined

  for (const prop of node.properties ?? []) {
    if (prop.type !== 'ObjectProperty') continue
    const key = prop.key?.name ?? prop.key?.value
    if (key !== propertyName) continue

    if (prop.value?.type === 'StringLiteral') {
      return prop.value.value
    }
  }

  return undefined
}

function extractSimpleObject(node: any): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (!node || node.type !== 'ObjectExpression') return result

  for (const prop of node.properties ?? []) {
    if (prop.type !== 'ObjectProperty') continue
    const key = prop.key?.name ?? prop.key?.value
    if (!key) continue
    result[key] = extractValue(prop.value)
  }

  return result
}

function extractValue(node: any): unknown {
  if (!node) return undefined

  switch (node.type) {
    case 'StringLiteral':
      return node.value
    case 'NumericLiteral':
      return node.value
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'ObjectExpression':
      return extractSimpleObject(node)
    case 'ArrayExpression':
      return (node.elements ?? []).map((el: any) => extractValue(el))
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return '__function__'
    default:
      return undefined
  }
}
