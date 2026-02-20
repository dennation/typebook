import type { ComponentType } from 'react'
import type {
  PropInfo,
  ResolvedComponent,
  ResolvedStory,
  ResolvedVariant,
  Story,
  StoryRenderFn,
  AllOfConfig,
  ValuesConfig,
  GenerateConfig,
  VariantConfig,
  MatrixRow,
  RegistryEntry,
  ComponentMeta,
} from './types.js'

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
 * Resolves a VariantConfig into an array of ResolvedVariants
 */
function resolveVariantConfig(
  config: VariantConfig,
  allProps: PropInfo[],
  baseProps: Record<string, unknown>,
): ResolvedVariant[] {
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
 * Resolves a full registry into ResolvedComponent[] for rendering.
 * Builds a Map<Component, ComponentMeta> and resolves allOf markers.
 */
export function resolveRegistry(registry: RegistryEntry[]): ResolvedComponent[] {
  // Build component → meta map for cross-file story resolution
  const metaMap = new Map<ComponentType<any>, ComponentMeta>()
  for (const entry of registry) {
    if (entry.meta) {
      metaMap.set(entry.config.component, entry.meta)
    }
  }

  return registry.map((entry) => {
    const { config, stories, meta } = entry
    const props = meta?.props ?? []

    const resolvedStories: ResolvedStory[] = []
    for (const [name, story] of Object.entries(stories)) {
      // For cross-file reused stories, look up meta by story's component reference
      const storyProps = story.component === config.component
        ? props
        : (metaMap.get(story.component)?.props ?? [])

      resolvedStories.push(resolveStory(name, story, storyProps))
    }

    return {
      component: config.component,
      name:
        config.title ??
        config.component.displayName ??
        config.component.name ??
        'Unknown',
      title: config.title,
      group: config.group,
      defaults: config.defaults,
      props,
      stories: resolvedStories,
    }
  })
}

function resolveStory(
  name: string,
  story: Story,
  allProps: PropInfo[],
): ResolvedStory {
  const defaults = story.defaults

  if (story.kind === 'single') {
    const mergedProps = { ...defaults, ...story.props }
    return {
      name,
      kind: 'single',
      variants: [{ label: 'default', props: mergedProps }],
      render: story.render,
    }
  }

  if (story.kind === 'matrix') {
    return resolveMatrixStory(name, story, allProps, defaults, story.render)
  }

  // Variants story
  const baseProps = { ...defaults, ...story.props }
  const variants = resolveVariantConfig(story.items, allProps, baseProps)

  return {
    name,
    kind: 'variants',
    variants,
    columns: story.columns,
    render: story.render,
  }
}

function resolveMatrixStory(
  name: string,
  story: { x: VariantConfig; y: VariantConfig[]; props?: Record<string, unknown> },
  allProps: PropInfo[],
  defaults: Record<string, unknown>,
  render: StoryRenderFn,
): ResolvedStory {
  const baseProps = { ...defaults, ...story.props }

  const xVariants = resolveVariantConfig(story.x, allProps, {})
  if (xVariants.length === 0) {
    return { name, kind: 'matrix', variants: [], render }
  }

  const xProp = (story.x as AllOfConfig | ValuesConfig | GenerateConfig).prop
  const xValues = xVariants.map((v) => v.props[xProp])

  const rows: MatrixRow[] = []
  for (const yConfig of story.y) {
    const yVariants = resolveVariantConfig(yConfig, allProps, {})
    if (yVariants.length === 0) continue

    const yProp = (yConfig as AllOfConfig | ValuesConfig | GenerateConfig).prop

    for (const yVariant of yVariants) {
      const yValue = yVariant.props[yProp]

      const rowVariants: ResolvedVariant[] = xValues.map((xValue) => ({
        label: String(xValue),
        props: {
          ...baseProps,
          [xProp]: xValue,
          [yProp]: yValue,
        },
      }))

      rows.push({
        label: String(yValue),
        variants: rowVariants,
      })
    }
  }

  return {
    name,
    kind: 'matrix',
    matrix: {
      primaryProp: xProp,
      primaryValues: xValues.map(String),
      rows,
    },
    render,
  }
}

function generateVariantsFromType(
  propInfo: PropInfo,
  propName: string,
  baseProps: Record<string, unknown>,
): ResolvedVariant[] {
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
