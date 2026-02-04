export interface ComponentEntry {
  name: string
  filePath: string
  importPath: string
  previews: PreviewEntry[]
}

export interface PreviewEntry {
  name: string
  kind: string
  variants: { label: string; props: Record<string, unknown> }[]
  layout: { type: string; gap?: number; columns?: number }
  theme: string
}

export interface Config {
  breakpoints: Record<string, number>
  port: number
  stylesPath: string | null
}

export interface RenderMessage {
  type: 'RENDER'
  component: string
  preview: string
  filePath: string
  importPath: string
  variants: { label: string; props: Record<string, unknown> }[]
  layout: { type: string; gap?: number; columns?: number }
  theme: string
}
