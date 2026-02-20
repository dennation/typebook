import type { RegistryEntry } from '../../types.js'

export interface GroupedComponents {
  group: string | null
  components: RegistryEntry[]
}

export function groupComponents(registry: RegistryEntry[]): GroupedComponents[] {
  const groups = new Map<string | null, RegistryEntry[]>()

  for (const entry of registry) {
    const group = entry.config.group ?? null
    if (!groups.has(group)) {
      groups.set(group, [])
    }
    groups.get(group)!.push(entry)
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
