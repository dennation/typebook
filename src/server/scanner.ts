import { glob } from 'glob'
import { resolve, relative, dirname, basename } from 'node:path'
import { parsePreviewFile } from '../parser/preview-parser.js'
import type {
  ParsedPreviewFile,
  ComponentEntry,
  PreviewEntry,
  PropInfo,
  Layout,
  Theme,
} from '../types.js'
import { DEFAULT_LAYOUT, DEFAULT_THEME } from '../types.js'

/**
 * Scans the workspace for .preview.tsx files and builds
 * a component registry.
 */
export async function scanPreviewFiles(
  cwd: string,
  includeGlob: string,
): Promise<ParsedPreviewFile[]> {
  const pattern = resolve(cwd, includeGlob)
  const files = await glob(pattern, { absolute: true })
  const results: ParsedPreviewFile[] = []

  for (const filePath of files) {
    try {
      const parsed = await parsePreviewFile(filePath)
      results.push(parsed)
    } catch (err) {
      console.error(`[studio] Failed to parse ${filePath}:`, err)
    }
  }

  return results
}

/**
 * Builds a component registry from parsed preview files and type info.
 */
export function buildRegistry(
  cwd: string,
  parsed: ParsedPreviewFile[],
  typeMap: Map<string, PropInfo[]>,
): ComponentEntry[] {
  const entries: ComponentEntry[] = []

  for (const file of parsed) {
    for (const setup of file.setups) {
      const props = typeMap.get(setup.componentName) ?? []

      const previews: PreviewEntry[] = []
      for (const exp of file.exports) {
        if (exp.setupVariable !== setup.variableName) continue

        const layout: Layout =
          exp.options?.layout ?? setup.layout ?? DEFAULT_LAYOUT
        const theme: Theme =
          (exp.options?.theme as Theme) ?? setup.theme ?? DEFAULT_THEME

        if (exp.kind === 'showVariants' && exp.prop) {
          const propInfo = props.find((p) => p.name === exp.prop)
          const variants = propInfo
            ? generateVariantsFromType(
                propInfo,
                setup.defaults,
                exp.options?.props,
              )
            : [{ label: exp.prop, props: { ...setup.defaults } }]

          previews.push({
            name: exp.name,
            kind: 'showVariants',
            prop: exp.prop,
            variants,
            layout,
            theme,
          })
        } else {
          previews.push({
            name: exp.name,
            kind: 'show',
            variants: [{ label: exp.name, props: { ...setup.defaults } }],
            layout,
            theme,
          })
        }
      }

      const name = setup.componentName.toLowerCase()
      entries.push({
        name,
        filePath: relative(cwd, file.filePath),
        importPath: setup.importPath,
        props,
        previews,
      })
    }
  }

  return entries
}

function generateVariantsFromType(
  propInfo: PropInfo,
  defaults: Record<string, unknown>,
  extraProps?: Record<string, unknown>,
): { label: string; props: Record<string, unknown> }[] {
  const base = { ...defaults, ...extraProps }

  switch (propInfo.type.kind) {
    case 'literal':
      return propInfo.type.values.map((v) => ({
        label: v,
        props: { ...base, [propInfo.name]: v },
      }))
    case 'boolean':
      return [
        { label: 'true', props: { ...base, [propInfo.name]: true } },
        { label: 'false', props: { ...base, [propInfo.name]: false } },
      ]
    default:
      return [{ label: propInfo.name, props: base }]
  }
}
