import type { ResolvedComponent } from '../../types.js'

export interface GroupedComponents {
  group: string | null
  components: ResolvedComponent[]
}

export function groupComponents(registry: ResolvedComponent[]): GroupedComponents[] {
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
