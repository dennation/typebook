import type { RegistryEntry } from '../../types.js'

export interface SidebarNode {
  label: string
  components: RegistryEntry[]
  children: SidebarNode[]
}

export function buildSidebarTree(registry: RegistryEntry[]): SidebarNode[] {
  const root: SidebarNode[] = []

  for (const entry of registry) {
    const path = entry.config.path
    if (!path) {
      root.push({ label: '', components: [entry], children: [] })
      continue
    }

    const segments = path.split('/')

    let level = root
    let node: SidebarNode | undefined

    for (const segment of segments) {
      node = level.find((n) => n.label === segment)
      if (!node) {
        node = { label: segment, components: [], children: [] }
        level.push(node)
      }
      level = node.children
    }

    node!.components.push(entry)
  }

  return root
}
