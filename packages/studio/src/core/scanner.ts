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
 * Parse a .stories.tsx file to extract export names and detect define/defineCompound calls.
 * Uses simple regex-based analysis to avoid needing to execute the module.
 */
export function analyzeStoryFile(content: string): {
  defaultExport: boolean
  namedExports: string[]
  componentImport: { name: string; path: string } | null
  /** True if the file uses defineCompound() instead of define() */
  compound: boolean
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

  // Detect if this is a compound component story
  const compound = /defineCompound\s*\(/.test(content)

  // Find the component import used in define() or first part in defineCompound()
  let componentImport: { name: string; path: string } | null = null

  if (compound) {
    // For defineCompound, find the first component name in parts: { ... }
    // Pattern: parts: { root: ComponentName, ... }
    const partsMatch = content.match(/parts\s*:\s*\{[^}]*\b(\w+)\s*:\s*(\w+)/)
    if (partsMatch) {
      const componentName = partsMatch[2]
      const importRegex = new RegExp(
        `import\\s+\\{[^}]*\\b${componentName}\\b[^}]*\\}\\s+from\\s+['"]([^'"]+)['"]`,
      )
      const importMatch = content.match(importRegex)
      if (importMatch) {
        componentImport = { name: componentName, path: importMatch[1] }
      }
    }
  } else {
    const defineMatch = content.match(/define\(\s*(\w+)/)
    if (defineMatch) {
      const componentName = defineMatch[1]
      const importRegex = new RegExp(
        `import\\s+\\{[^}]*\\b${componentName}\\b[^}]*\\}\\s+from\\s+['"]([^'"]+)['"]`,
      )
      const importMatch = content.match(importRegex)
      if (importMatch) {
        componentImport = { name: componentName, path: importMatch[1] }
      }
    }
  }

  return { defaultExport, namedExports, componentImport, compound }
}
