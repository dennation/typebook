import type {
  DefineResult,
  PropInfo,
  ResolvedComponent,
  ResolvedStory,
  ResolvedVariant,
  ResolveStoriesInput,
  Story,
  AllOfConfig,
  ValuesConfig,
  GenerateConfig,
  VariantConfig,
  MatrixRow,
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
    // Auto-generate from prop type
    const propInfo = allProps.find((p) => p.name === config.prop)
    if (!propInfo) return []

    return generateVariantsFromType(propInfo, config.prop, baseProps)
  }

  if (isValuesConfig(config)) {
    // Manual values
    return config.values.map((value) => ({
      label: String(value),
      props: { ...baseProps, [config.prop]: value },
    }))
  }

  if (isGenerateConfig(config)) {
    // Generated values
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
 * Resolves stories by replacing VariantConfig markers with actual variant values
 * from the extracted prop types.
 */
export function resolve(
  defineResult: DefineResult<any>,
  input: ResolveStoriesInput,
): ResolvedComponent {
  const { props, stories } = input
  const resolvedStories: ResolvedStory[] = []

  for (const entry of stories) {
    const { name, story } = entry
    resolvedStories.push(resolveStory(name, story, props, defineResult.defaults))
  }

  return {
    component: defineResult.component,
    name:
      defineResult.title ??
      defineResult.component.displayName ??
      defineResult.component.name ??
      'Unknown',
    title: defineResult.title,
    group: defineResult.group,
    defaults: defineResult.defaults,
    props,
    stories: resolvedStories,
  }
}

function resolveStory(
  name: string,
  story: Story,
  allProps: PropInfo[],
  defaults: Record<string, unknown>,
): ResolvedStory {
  // Single story — single variant with merged props
  if (story.kind === 'single') {
    const mergedProps = { ...defaults, ...story.props }
    return {
      name,
      kind: 'single',
      variants: [{ label: 'default', props: mergedProps }],
      render: story.render,
    }
  }

  // Matrix story — cross-product of x and y props
  if (story.kind === 'matrix') {
    return resolveMatrixStoryFromConfigs(name, story, allProps, defaults)
  }

  // Variants story — resolve items config
  const baseProps = { ...defaults, ...story.props }
  const variants = resolveVariantConfig(story.items, allProps, baseProps)

  return {
    name,
    kind: 'variants',
    variants,
    columns: story.columns,
  }
}

function resolveMatrixStoryFromConfigs(
  name: string,
  story: { x: VariantConfig; y: VariantConfig[]; props?: Record<string, unknown> },
  allProps: PropInfo[],
  defaults: Record<string, unknown>,
): ResolvedStory {
  const baseProps = { ...defaults, ...story.props }

  // Resolve x (columns) config - extract just the values
  const xVariants = resolveVariantConfig(story.x, allProps, {})
  if (xVariants.length === 0) {
    return { name, kind: 'matrix', variants: [] }
  }

  // Get the prop name from x config
  const xProp = (story.x as AllOfConfig | ValuesConfig | GenerateConfig).prop
  const xValues = xVariants.map((v) => v.props[xProp])

  // Generate rows for each y config
  const rows: MatrixRow[] = []
  for (const yConfig of story.y) {
    const yVariants = resolveVariantConfig(yConfig, allProps, {})
    if (yVariants.length === 0) continue

    // Get the prop name from y config
    const yProp = (yConfig as AllOfConfig | ValuesConfig | GenerateConfig).prop

    // Create one row per y value
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
