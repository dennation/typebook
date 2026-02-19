import type {
  DefineResult,
  CompoundDefineResult,
  PropInfo,
  ResolvedComponent,
  ResolvedStory,
  ResolvedVariant,
  ResolveStoriesInput,
  ResolveCompoundInput,
  CompoundPartInfo,
  Story,
  StoryRenderFn,
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
    return resolveMatrixStoryFromConfigs(name, story, allProps, defaults, story.render)
  }

  // Variants story — resolve items config
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

function resolveMatrixStoryFromConfigs(
  name: string,
  story: { x: VariantConfig; y: VariantConfig[]; props?: Record<string, unknown> },
  allProps: PropInfo[],
  defaults: Record<string, unknown>,
  render: StoryRenderFn,
): ResolvedStory {
  const baseProps = { ...defaults, ...story.props }

  // Resolve x (columns) config - extract just the values
  const xVariants = resolveVariantConfig(story.x, allProps, {})
  if (xVariants.length === 0) {
    return { name, kind: 'matrix', variants: [], render }
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

// --- Compound Component Resolution ---

/**
 * Merges per-part defaults with per-part story props.
 * Returns a flat Record<string, Record<string, unknown>> keyed by part name.
 */
function mergeCompoundProps(
  partNames: string[],
  defaults: Record<string, Record<string, unknown>>,
  storyProps?: Record<string, unknown>,
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {}
  for (const part of partNames) {
    result[part] = {
      ...(defaults[part] ?? {}),
      ...((storyProps as any)?.[part] ?? {}),
    }
  }
  return result
}

/**
 * Resolves a VariantConfig for compound components (part-aware).
 * Returns variants with per-part nested props.
 */
function resolveCompoundVariantConfig(
  config: VariantConfig,
  partProps: Record<string, PropInfo[]>,
  partNames: string[],
  baseCompoundProps: Record<string, Record<string, unknown>>,
): ResolvedVariant[] {
  const part = config.part
  if (!part) return []

  const propsForPart = partProps[part] ?? []

  if (isAllOfConfig(config)) {
    const propInfo = propsForPart.find((p) => p.name === config.prop)
    if (!propInfo) return []
    return generateCompoundVariantsFromType(propInfo, config.prop, part, partNames, baseCompoundProps)
  }

  if (isValuesConfig(config)) {
    return config.values.map((value) => ({
      label: String(value),
      props: buildCompoundVariantProps(part, config.prop, value, partNames, baseCompoundProps),
    }))
  }

  if (isGenerateConfig(config)) {
    const values: unknown[] = []
    for (let i = 0; i < config.count; i++) {
      values.push(config.fn())
    }
    return values.map((value) => ({
      label: String(value),
      props: buildCompoundVariantProps(part, config.prop, value, partNames, baseCompoundProps),
    }))
  }

  return []
}

/**
 * Builds compound variant props: all parts get their base props,
 * the targeted part gets the varied prop value.
 */
function buildCompoundVariantProps(
  targetPart: string,
  propName: string,
  value: unknown,
  partNames: string[],
  baseCompoundProps: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {}
  for (const part of partNames) {
    if (part === targetPart) {
      result[part] = { ...(baseCompoundProps[part] ?? {}), [propName]: value }
    } else {
      result[part] = { ...(baseCompoundProps[part] ?? {}) }
    }
  }
  return result
}

function generateCompoundVariantsFromType(
  propInfo: PropInfo,
  propName: string,
  part: string,
  partNames: string[],
  baseCompoundProps: Record<string, Record<string, unknown>>,
): ResolvedVariant[] {
  switch (propInfo.type.kind) {
    case 'literal':
      return propInfo.type.values.map((v) => ({
        label: v,
        props: buildCompoundVariantProps(part, propName, v, partNames, baseCompoundProps),
      }))
    case 'boolean':
      return [
        { label: 'true', props: buildCompoundVariantProps(part, propName, true, partNames, baseCompoundProps) },
        { label: 'false', props: buildCompoundVariantProps(part, propName, false, partNames, baseCompoundProps) },
      ]
    default:
      return [{ label: propName, props: baseCompoundProps }]
  }
}

/**
 * Resolves a compound component's stories by replacing VariantConfig markers
 * with actual variant values from per-part extracted prop types.
 */
export function resolveCompound(
  defineResult: CompoundDefineResult<any>,
  input: ResolveCompoundInput,
): ResolvedComponent {
  const { partProps, stories } = input
  const partNames = Object.keys(defineResult.parts)
  const resolvedStories: ResolvedStory[] = []

  for (const entry of stories) {
    const { name, story } = entry
    resolvedStories.push(
      resolveCompoundStory(name, story, partProps, partNames, defineResult.defaults),
    )
  }

  // Build parts info for UI
  const parts: Record<string, CompoundPartInfo> = {}
  for (const partName of partNames) {
    parts[partName] = {
      component: defineResult.parts[partName],
      props: partProps[partName] ?? [],
      defaults: defineResult.defaults[partName] ?? {},
    }
  }

  // Use the first part's component as the "primary" component
  const firstPartName = partNames[0]
  const primaryComponent = defineResult.parts[firstPartName]

  // Determine name: use title, or derive from first part component name
  const name = defineResult.title ?? primaryComponent?.displayName ?? primaryComponent?.name ?? 'Unknown'

  // Flatten all part props for backward compat (props field)
  const allProps: PropInfo[] = []
  for (const partName of partNames) {
    for (const prop of partProps[partName] ?? []) {
      allProps.push(prop)
    }
  }

  return {
    component: primaryComponent,
    name,
    title: defineResult.title,
    group: defineResult.group,
    defaults: defineResult.defaults as any,
    props: allProps,
    stories: resolvedStories,
    compound: true,
    parts,
    compoundRender: defineResult.compoundRender,
  }
}

function resolveCompoundStory(
  name: string,
  story: Story,
  partProps: Record<string, PropInfo[]>,
  partNames: string[],
  defaults: Record<string, Record<string, unknown>>,
): ResolvedStory {
  // Single story
  if (story.kind === 'single') {
    const mergedProps = mergeCompoundProps(partNames, defaults, story.props)
    return {
      name,
      kind: 'single',
      variants: [{ label: 'default', props: mergedProps as any }],
      render: story.render,
    }
  }

  // Matrix story
  if (story.kind === 'matrix') {
    return resolveCompoundMatrixStory(name, story, partProps, partNames, defaults, story.render)
  }

  // Variants story
  const baseCompoundProps = mergeCompoundProps(partNames, defaults, story.props)
  const variants = resolveCompoundVariantConfig(
    story.items,
    partProps,
    partNames,
    baseCompoundProps,
  )

  return {
    name,
    kind: 'variants',
    variants,
    columns: story.columns,
    render: story.render,
  }
}

function resolveCompoundMatrixStory(
  name: string,
  story: { x: VariantConfig; y: VariantConfig[]; props?: Record<string, unknown> },
  partProps: Record<string, PropInfo[]>,
  partNames: string[],
  defaults: Record<string, Record<string, unknown>>,
  render: StoryRenderFn,
): ResolvedStory {
  const baseCompoundProps = mergeCompoundProps(partNames, defaults, story.props)

  // Resolve x (columns)
  const xVariants = resolveCompoundVariantConfig(story.x, partProps, partNames, baseCompoundProps)
  if (xVariants.length === 0) {
    return { name, kind: 'matrix', variants: [], render }
  }

  const xProp = story.x.prop
  const xPart = story.x.part!
  const xValues = xVariants.map((v) => (v.props as any)[xPart]?.[xProp])

  // Generate rows for each y config
  const rows: MatrixRow[] = []
  for (const yConfig of story.y) {
    const yPart = yConfig.part!
    const yProp = yConfig.prop
    const yVariants = resolveCompoundVariantConfig(yConfig, partProps, partNames, baseCompoundProps)
    if (yVariants.length === 0) continue

    for (const yVariant of yVariants) {
      const yValue = (yVariant.props as any)[yPart]?.[yProp]

      const rowVariants: ResolvedVariant[] = xValues.map((xValue) => {
        // Build compound props with both x and y values set
        const compoundProps: Record<string, Record<string, unknown>> = {}
        for (const part of partNames) {
          compoundProps[part] = { ...(baseCompoundProps[part] ?? {}) }
        }
        // Set x value
        if (!compoundProps[xPart]) compoundProps[xPart] = {}
        compoundProps[xPart][xProp] = xValue
        // Set y value
        if (!compoundProps[yPart]) compoundProps[yPart] = {}
        compoundProps[yPart][yProp] = yValue

        return {
          label: String(xValue),
          props: compoundProps as any,
        }
      })

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
      primaryProp: `${xPart}.${xProp}`,
      primaryValues: xValues.map(String),
      rows,
    },
    render,
  }
}
