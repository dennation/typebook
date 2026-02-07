import { useState, useCallback, type CSSProperties } from 'react'
import type { ResolvedComponent, ResolvedStory } from '../types.js'
import { ShadowRoot } from './ShadowRoot.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { studioStyles } from './styles.js'

export interface StudioProps {
  registry: ResolvedComponent[]
  theme?: 'light' | 'dark'
}

export function Studio({ registry, theme: initialTheme = 'light' }: StudioProps) {
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  const [activeStory, setActiveStory] = useState<string | null>(null)
  const [theme, setTheme] = useState(initialTheme)

  const selectStory = useCallback((componentName: string, storyName: string) => {
    setActiveComponent(componentName)
    setActiveStory(storyName)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  // Find active data
  const comp = registry.find((c) => c.name === activeComponent)
  const story = comp?.stories.find((s) => s.name === activeStory)

  // Group components by group
  const grouped = groupComponents(registry)

  return (
    <ShadowRoot styles={studioStyles}>
      <div className="studio-layout" data-theme={theme}>
        {/* Header */}
        <header className="studio-header">
          <span className="studio-header-title">Studio</span>
          <div className="studio-header-controls">
            <button
              className="studio-theme-toggle"
              title="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === 'light' ? '\u263C' : '\u263E'}
            </button>
          </div>
        </header>

        {/* Sidebar */}
        <nav className="studio-sidebar">
          {grouped.map(({ group, components }) => (
            <div key={group ?? '__ungrouped'}>
              {group && <div className="studio-group-title">{group}</div>}
              {components.map((c) => (
                <div key={c.name}>
                  <div className="studio-component-name">{c.title ?? c.name}</div>
                  {c.stories.map((s) => (
                    <button
                      key={s.name}
                      className="studio-story-item"
                      data-active={activeComponent === c.name && activeStory === s.name}
                      onClick={() => selectStory(c.name, s.name)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Main content */}
        <main className="studio-main">
          {comp && story ? (
            <>
              <div className="studio-preview-title">
                {comp.title ?? comp.name} / {story.name}
              </div>
              <StoryRenderer story={story} component={comp.component} />
            </>
          ) : (
            <div className="studio-empty">Select a story</div>
          )}
        </main>
      </div>
    </ShadowRoot>
  )
}

function StoryRenderer({
  story,
  component: Component,
}: {
  story: ResolvedStory
  component: React.ComponentType<any>
}) {
  const layoutStyle = getLayoutStyle(story)

  return (
    <div style={layoutStyle}>
      {story.variants.map((variant, i) => (
        <div
          key={variant.label + i}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <ErrorBoundary>
            <Component {...variant.props} />
          </ErrorBoundary>
          <span className="studio-variant-label">{variant.label}</span>
        </div>
      ))}
    </div>
  )
}

function getLayoutStyle(story: ResolvedStory): CSSProperties {
  const gap = 16
  if (story.columns) {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${story.columns}, 1fr)`,
      gap,
    }
  }
  return {
    display: 'flex',
    gap,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  }
}

interface GroupedComponents {
  group: string | null
  components: ResolvedComponent[]
}

function groupComponents(registry: ResolvedComponent[]): GroupedComponents[] {
  const groups = new Map<string | null, ResolvedComponent[]>()

  for (const comp of registry) {
    const group = comp.group ?? null
    if (!groups.has(group)) {
      groups.set(group, [])
    }
    groups.get(group)!.push(comp)
  }

  const result: GroupedComponents[] = []

  // Named groups first
  for (const [group, components] of groups) {
    if (group !== null) {
      result.push({ group, components })
    }
  }

  // Ungrouped last
  const ungrouped = groups.get(null)
  if (ungrouped) {
    result.push({ group: null, components: ungrouped })
  }

  return result
}
