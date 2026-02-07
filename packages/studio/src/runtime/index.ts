import type {
  DefineResult,
  PropInfo,
  ResolvedComponent,
  ResolvedStory,
  ResolvedVariant,
  ResolveStoriesInput,
  StoryExport,
  ValuesOfMarker,
} from '../types.js'

function isValuesOfMarker(v: unknown): v is ValuesOfMarker {
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as any).__type === 'valuesOf'
  )
}

/**
 * Resolves stories by replacing valuesOf() markers with actual variant values
 * from the extracted prop types.
 */
export function resolveStories(
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
    stories: resolvedStories,
  }
}

function resolveStory(
  name: string,
  story: StoryExport,
  allProps: PropInfo[],
  defaults: Record<string, unknown>,
): ResolvedStory {
  // Static story — single variant with merged props
  if (story.kind === 'static') {
    return {
      name,
      kind: 'static',
      variants: [{ label: 'default', props: story.props ?? { ...defaults } }],
    }
  }

  // Variant story — resolve values
  if (!story.variants) {
    return { name, kind: 'variants', variants: [] }
  }

  const variantsConfig = story.variants
  const extraProps = story.extraProps ?? {}
  const baseProps = { ...defaults, ...extraProps }

  if (isValuesOfMarker(variantsConfig)) {
    // Auto-generate from prop types
    const propInfo = allProps.find((p) => p.name === variantsConfig.prop)
    if (!propInfo) {
      return { name, kind: 'variants', variants: [], columns: variantsConfig.columns }
    }

    const variants = generateVariantsFromType(
      propInfo,
      variantsConfig.prop,
      baseProps,
    )

    return {
      name,
      kind: 'variants',
      variants,
      columns: variantsConfig.columns,
    }
  }

  // Manual values
  const variants: ResolvedVariant[] = variantsConfig.values.map((value) => ({
    label: String(value),
    props: { ...baseProps, [variantsConfig.prop]: value },
  }))

  return {
    name,
    kind: 'variants',
    variants,
    columns: variantsConfig.columns,
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
