import { readFileSync } from 'node:fs'
import type { ParsedPreviewFile, ParsedSetup, ParsedExport } from '../types.js'

/**
 * Parses a .preview.tsx file to extract:
 * - setup() calls with component name & import path
 * - Exported show() and showVariants() calls
 *
 * Uses oxc-parser for AST analysis.
 */
export async function parsePreviewFile(
  filePath: string,
): Promise<ParsedPreviewFile> {
  const oxc = await import('oxc-parser')
  const source = readFileSync(filePath, 'utf-8')
  const result = oxc.parseSync(filePath, source)
  const ast = JSON.parse(result.program)

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

  // Find variable declarations with setup() calls
  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration') continue

    for (const decl of node.declarations ?? []) {
      const init = decl.init
      if (!init || init.type !== 'CallExpression') continue
      if (init.callee?.name !== 'setup') continue

      const args = init.arguments ?? []
      if (args.length < 2) continue

      const componentRef = args[0]
      const componentName = componentRef?.name
      if (!componentName) continue

      const importPath = importMap.get(componentName) ?? ''
      const variableName = decl.id?.name ?? ''

      const configArg = args[1]
      const setup: ParsedSetup = {
        componentName,
        importPath,
        variableName,
        defaults: extractObjectLiteral(configArg, 'defaults', source),
        layout: extractObjectLiteral(configArg, 'layout', source) as any,
        theme: extractStringProperty(configArg, 'theme', source),
      }

      setups.push(setup)
    }
  }

  // Find exported show() and showVariants() calls
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
            props: extractObjectLiteral(args[1], 'props', source),
            layout: extractObjectLiteral(args[1], 'layout', source) as any,
            theme: extractStringProperty(args[1], 'theme', source),
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
  _source: string,
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
  _source: string,
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
