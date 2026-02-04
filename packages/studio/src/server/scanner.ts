import { glob } from 'glob'
import { resolve, relative } from 'node:path'
import type { ViteDevServer } from 'vite'
import type {
  ComponentEntry,
  PreviewEntry,
  PreviewExport,
  PropInfo,
} from '../types.js'

/**
 * Find all .preview.tsx files matching the include glob.
 */
export async function findPreviewFiles(
  cwd: string,
  includeGlob: string,
): Promise<string[]> {
  const pattern = resolve(cwd, includeGlob)
  return glob(pattern, { absolute: true })
}

/**
 * Load preview modules via Vite SSR and build the component registry.
 */
export async function loadPreviewModules(
  vite: ViteDevServer,
  files: string[],
  cwd: string,
  typeMap: Map<string, PropInfo[]>,
): Promise<ComponentEntry[]> {
  const entries: ComponentEntry[] = []

  for (const filePath of files) {
    try {
      const mod = await vite.ssrLoadModule(filePath)

      // Collect all named exports that are PreviewExport objects
      const previews: PreviewEntry[] = []
      let componentName: string | undefined

      for (const [exportName, value] of Object.entries(mod)) {
        if (exportName === 'default') continue
        const exp = value as PreviewExport
        if (exp?.__type !== 'preview') continue

        componentName ??=
          exp.component.displayName || exp.component.name || 'Unknown'

        const props = typeMap.get(componentName) ?? []

        if (exp.kind === 'showVariants' && exp.prop) {
          const propInfo = props.find((p) => p.name === exp.prop)
          const variants = propInfo
            ? generateVariantsFromType(propInfo, exp.defaults)
            : exp.variants

          previews.push({
            name: exportName,
            kind: 'showVariants',
            prop: exp.prop,
            variants,
            layout: exp.layout,
            theme: exp.theme,
          })
        } else {
          previews.push({
            name: exportName,
            kind: 'show',
            variants: exp.variants,
            layout: exp.layout,
            theme: exp.theme,
          })
        }
      }

      if (componentName && previews.length > 0) {
        entries.push({
          name: componentName.toLowerCase(),
          filePath: relative(cwd, filePath),
          importPath: filePath,
          props: typeMap.get(componentName) ?? [],
          previews,
        })
      }
    } catch (err) {
      console.error(`[studio] Failed to load ${filePath}:`, err)
    }
  }

  return entries
}

function generateVariantsFromType(
  propInfo: PropInfo,
  defaults: Record<string, unknown>,
): { label: string; props: Record<string, unknown> }[] {
  const base = { ...defaults }

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
