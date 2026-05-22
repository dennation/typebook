import type {
  PropInfo,
  VariantConfig,
} from './types.js'

interface Variant {
  label: string
  props: Record<string, unknown>
}

/**
 * Resolves a VariantConfig marker into concrete variant entries.
 * Used by variant and matrix story renderers.
 */
export function resolveVariantConfig(
  config: VariantConfig,
  allProps: PropInfo[],
  baseProps: Record<string, unknown>,
): Variant[] {
  switch (config.__type) {
    case 'allOf': {
      const propInfo = allProps.find((p) => p.name === config.prop)
      if (!propInfo) return []
      return generateVariantsFromType(propInfo, config.prop, baseProps)
    }
    case 'values':
      return config.values.map((value) => ({
        label: String(value),
        props: { ...baseProps, [config.prop]: value },
      }))
    case 'generate': {
      const values: unknown[] = []
      for (let i = 0; i < config.count; i++) {
        values.push(config.fn())
      }
      return values.map((value) => ({
        label: String(value),
        props: { ...baseProps, [config.prop]: value },
      }))
    }
  }
}

/**
 * Extracts the prop name from any VariantConfig.
 */
export function getVariantProp(config: VariantConfig): string {
  return config.prop
}

function generateVariantsFromType(
  propInfo: PropInfo,
  propName: string,
  baseProps: Record<string, unknown>,
): Variant[] {
  switch (propInfo.type.kind) {
    case 'literal':
      return propInfo.type.values.map((v) => ({
        label: v,
        props: { ...baseProps, [propName]: v },
      }))
    case 'boolean':
      return [
        { label: 'true', props: { ...baseProps, [propName]: true } },
        { label: 'false', props: { ...baseProps, [propName]: false } },
      ]
    default:
      return [{ label: propName, props: baseProps }]
  }
}
