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
 * Parse a .stories.tsx file to extract export names and detect valuesOf() calls.
 * Uses simple regex-based analysis to avoid needing to execute the module.
 */
export function analyzeStoryFile(content: string): {
  defaultExport: boolean
  namedExports: string[]
  componentImport: { name: string; path: string } | null
} {
  const namedExports: string[] = []

  // Find named exports: export const Sizes = ...
  const exportRegex = /export\s+const\s+(\w+)\s*=/g
  let match
  while ((match = exportRegex.exec(content)) !== null) {
    namedExports.push(match[1])
  }

  // Check for default export
  const defaultExport = /export\s+default\s+/.test(content)

  // Find the component import used in define()
  // Pattern: import { ComponentName } from './path'
  // We look for the component passed to define() first
  let componentImport: { name: string; path: string } | null = null

  const defineMatch = content.match(/define\(\s*(\w+)/)
  if (defineMatch) {
    const componentName = defineMatch[1]
    // Find the import statement for this component
    const importRegex = new RegExp(
      `import\\s+\\{[^}]*\\b${componentName}\\b[^}]*\\}\\s+from\\s+['"]([^'"]+)['"]`,
    )
    const importMatch = content.match(importRegex)
    if (importMatch) {
      componentImport = { name: componentName, path: importMatch[1] }
    }
  }

  return { defaultExport, namedExports, componentImport }
}
