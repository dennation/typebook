import type { Story, SingleStory, VariantsStory, MatrixStory, PropInfo } from '../../types.js'
import { resolveVariantConfig, variantConfigProp } from '../../resolve.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { VariantCard } from './VariantCard.js'
import { IframePreview } from './IframePreview.js'
import { getGridStyle } from '../utils/getLayoutStyle.js'

export function StoryRenderer({ story, props }: { story: Story; props: PropInfo[] }) {
  switch (story.kind) {
    case 'single':
      return <RenderSingle story={story} />
    case 'variants':
      return <RenderVariants story={story} props={props} />
    case 'matrix':
      return <RenderMatrix story={story} props={props} />
  }
}

function RenderSingle({ story }: { story: SingleStory }) {
  const merged = { ...story.defaults, ...story.props }

  return (
    <VariantCard label="default" props={merged} render={story.render} />
  )
}

function RenderVariants({ story, props }: { story: VariantsStory; props: PropInfo[] }) {
  const baseProps = { ...story.defaults, ...story.props }
  const variants = resolveVariantConfig(story.items, props, baseProps)

  return (
    <div style={getGridStyle(variants.length, story.columns)}>
      {variants.map((v) => (
        <VariantCard key={v.label} label={v.label} props={v.props} render={story.render} />
      ))}
    </div>
  )
}

function RenderMatrix({ story, props }: { story: MatrixStory; props: PropInfo[] }) {
  const baseProps = { ...story.defaults, ...story.props }

  const xVariants = resolveVariantConfig(story.x, props, {})
  if (xVariants.length === 0) return null

  const xProp = variantConfigProp(story.x)
  const xValues = xVariants.map((v) => v.props[xProp])

  const rows: { label: string; cells: { label: string; props: Record<string, unknown> }[] }[] = []
  for (const yConfig of story.y) {
    const yVariants = resolveVariantConfig(yConfig, props, {})
    if (yVariants.length === 0) continue

    const yProp = variantConfigProp(yConfig)

    for (const yVariant of yVariants) {
      const yValue = yVariant.props[yProp]

      rows.push({
        label: String(yValue),
        cells: xValues.map((xValue) => ({
          label: String(xValue),
          props: { ...baseProps, [xProp]: xValue, [yProp]: yValue },
        })),
      })
    }
  }

  return (
    <div className="st:overflow-x-auto">
      <table className="st:w-full st:border-collapse">
        <thead>
          <tr>
            <th className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-left" />
            {xValues.map((value) => (
              <th
                key={String(value)}
                className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-center"
              >
                {String(value)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-left">
                {row.label}
              </td>
              {row.cells.map((cell) => (
                <td
                  key={`${row.label}-${cell.label}`}
                  className="st:border st:border-border st:p-0"
                >
                  <IframePreview className="st:p-4">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
                      <ErrorBoundary>
                        {story.render(cell.props)}
                      </ErrorBoundary>
                    </div>
                  </IframePreview>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
