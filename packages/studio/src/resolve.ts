import type {
  PropInfo,
  AllOfConfig,
  ValuesConfig,
  GenerateConfig,
  VariantConfig,
} from './types.js'

interface Variant {
  label: string
  props: Record<string, unknown>
}

function isAllOfConfig(v: unknown): v is AllOfConfig {
  return (
    typeof v === 'object' &&
    v !== null &&
    '__type' in v &&
    v.__type === 'allOf'
  )
}

function isValuesConfig(v: unknown): v is ValuesConfig {
  return (
    typeof v === 'object' &&
    v !== null &&
    '__type' in v &&
    v.__type === 'values'
  )
}

function isGenerateConfig(v: unknown): v is GenerateConfig {
  return (
    typeof v === 'object' &&
    v !== null &&
    '__type' in v &&
    v.__type === 'generate'
  )
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
  if (isAllOfConfig(config)) {
    const propInfo = allProps.find((p) => p.name === config.prop)
    if (!propInfo) return []
    return generateVariantsFromType(propInfo, config.prop, baseProps)
  }

  if (isValuesConfig(config)) {
    return config.values.map((value) => ({
      label: String(value),
      props: { ...baseProps, [config.prop]: value },
    }))
  }

  if (isGenerateConfig(config)) {
    const values: unknown[] = []
    for (let i = 0; i < config.count; i++) {
      values.push(config.fn())
    }
    return values.map((value) => ({
      label: String(value),
      props: { ...baseProps, [config.prop]: value },
    }))
  }

  return []
}

/**
 * Extracts the prop name from any VariantConfig.
 */
export function variantConfigProp(config: VariantConfig): string {
  return (config as AllOfConfig | ValuesConfig | GenerateConfig).prop
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
