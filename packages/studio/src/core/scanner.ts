import { glob } from 'glob'
import { resolve } from 'node:path'

/**
 * Find all .stories.tsx files matching the include glob.
 */
export async function findStoryFiles(
  cwd: string,
  includeGlob: string,
): Promise<string[]> {
  const pattern = resolve(cwd, includeGlob)
  return glob(pattern, { absolute: true })
}

/**
 * Find all .docs.tsx files matching the include glob.
 */
export async function findPageFiles(
  cwd: string,
  includeGlob: string,
): Promise<string[]> {
  const pattern = resolve(cwd, includeGlob)
  return glob(pattern, { absolute: true })
}

export interface StoryAnalysis {
  defaultExport: boolean
  namedExports: string[]
  componentImport: { name: string; path: string } | null
}

export interface PageAnalysis {
  defaultExport: boolean
}

const DESCRIBE_NAMES = new Set(['define', 'describe'])

/**
 * Parse a .stories.tsx file via oxc AST to extract exports and the component import.
 *
 * Extracts:
 * - Named exports: `export const Sizes = ...` and `export { Sizes } from ...`
 * - Default export: `export default ...`
 * - Component import: finds `define(Component, ...)` or `describe(Component, ...)` call,
 *   then resolves the matching ImportDeclaration (named or default import).
 */
export async function analyzeStoryFile(content: string): Promise<StoryAnalysis> {
  const oxc = await import('oxc-parser')
  const { program } = oxc.parseSync('story.tsx', content)
  const body: any[] = program.body

  const namedExports: string[] = []
  let defaultExport = false

  // Collect all imports: local name → { name, path }
  const imports = new Map<string, { name: string; path: string }>()

  // First argument of define()/describe() call
  let defineArg: string | null = null

  for (const node of body) {
    // --- Imports ---
    if (node.type === 'ImportDeclaration') {
      const source: string = node.source?.value ?? ''
      for (const spec of node.specifiers ?? []) {
        const localName: string = spec.local?.name
        if (!localName) continue

        if (spec.type === 'ImportDefaultSpecifier') {
          imports.set(localName, { name: localName, path: source })
        } else if (spec.type === 'ImportSpecifier') {
          imports.set(localName, { name: spec.imported?.name ?? localName, path: source })
        }
      }
    }

    // --- Named exports ---
    if (node.type === 'ExportNamedDeclaration') {
      // export const Foo = ...
      if (node.declaration?.type === 'VariableDeclaration') {
        for (const decl of node.declaration.declarations ?? []) {
          if (decl.id?.name) {
            namedExports.push(decl.id.name)
          }
        }
      }

      // export function Foo() { ... } / export class Foo { ... }
      if (node.declaration?.id?.name) {
        namedExports.push(node.declaration.id.name)
      }

      // export { Foo, Bar } or export { Foo } from './other'
      for (const spec of node.specifiers ?? []) {
        const exported = spec.exported?.name
        if (exported && exported !== 'default') {
          namedExports.push(exported)
        }
      }
    }

    // --- Default export ---
    if (node.type === 'ExportDefaultDeclaration') {
      defaultExport = true

      // Check for direct define()/describe() call: export default define(Component)
      if (!defineArg) {
        const decl = node.declaration
        if (
          decl?.type === 'CallExpression' &&
          decl.callee?.type === 'Identifier' &&
          DESCRIBE_NAMES.has(decl.callee.name)
        ) {
          const firstArg = decl.arguments?.[0]
          if (firstArg?.type === 'Identifier') {
            defineArg = firstArg.name
          }
        }
      }
    }

    // --- Find define()/describe() call in top-level variable declarations ---
    if (node.type === 'VariableDeclaration' && !defineArg) {
      defineArg = findDescribeArg(node.declarations)
    }
    if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration' && !defineArg) {
      defineArg = findDescribeArg(node.declaration.declarations)
    }
  }

  const componentImport = defineArg ? (imports.get(defineArg) ?? null) : null

  return { defaultExport, namedExports, componentImport }
}

/**
 * Parse a .docs.tsx file via oxc AST to check for a default export.
 */
export async function analyzePageFile(content: string): Promise<PageAnalysis> {
  const oxc = await import('oxc-parser')
  const { program } = oxc.parseSync('page.tsx', content)
  const body: any[] = program.body

  let defaultExport = false

  for (const node of body) {
    if (node.type === 'ExportDefaultDeclaration') {
      defaultExport = true
      break
    }
  }

  return { defaultExport }
}

/**
 * Search variable declarators for a `define(Component, ...)` or `describe(Component, ...)` call
 * and return the first argument name.
 */
function findDescribeArg(declarations: any[]): string | null {
  for (const decl of declarations ?? []) {
    const init = decl.init
    if (!init || init.type !== 'CallExpression') continue
    if (init.callee?.type !== 'Identifier' || !DESCRIBE_NAMES.has(init.callee.name)) continue

    const firstArg = init.arguments?.[0]
    if (firstArg?.type === 'Identifier') {
      return firstArg.name
    }
  }
  return null
}
