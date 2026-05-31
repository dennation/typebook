import type { Menu, MenuInput, MenuItem, MenuItemInput } from './types.js'

const UNORDERED = Number.MAX_SAFE_INTEGER

/**
 * The `parent` constraint: keys of the input object. For a dynamically-typed
 * `MenuInput` (`Record<string, …>`) this is `string`, so building a menu from
 * runtime data still type-checks; literal objects keep the precise key union.
 */
type MenuKeys<T> = Extract<keyof T, string>

/**
 * Resolve a keyed {@link MenuInput} into a nested {@link Menu}:
 *
 * - the object key is the item's identity (its `href` by default, or an id for a
 *   container with `href: false`); duplicate keys are impossible, so override is
 *   native object spread (`{ ...generated, '/button': { … } }`) — no de-dup pass;
 * - **resolve `parent`** (another key) into the nested tree; an unknown `parent`
 *   hoists the item to the top level (dev warning);
 * - **sort siblings by `order`** (ascending; unordered keep insertion order, last);
 * - **strip** `parent` / `order`, resolving `href` (key by default) onto the node.
 *
 * `parent` is type-checked against `keyof` the input — including route paths
 * flowing in from a router adapter spread.
 */
export function defineMenu<const T extends Record<string, MenuItemInput<MenuKeys<T>>>>(
  input: T,
): Menu {
  const isDev = process.env.NODE_ENV !== 'production'
  const entries = Object.entries(input as MenuInput)

  // Build a node per entry, keyed for parent resolution.
  const nodeByKey = new Map<string, MenuItem>()
  interface Placed {
    node: MenuItem
    parent: string | undefined
    order: number
    seq: number
  }
  const placedList: Placed[] = entries.map(([key, value], seq) => {
    const { href, parent, order, ...rest } = value
    const node: MenuItem = { ...rest }
    const resolvedHref = href === false ? undefined : (href ?? key)
    if (resolvedHref !== undefined) node.href = resolvedHref
    nodeByKey.set(key, node)
    return { node, parent, order: order ?? UNORDERED, seq }
  })

  // Bucket each node under its resolved parent (null = top level).
  const buckets = new Map<MenuItem | null, Placed[]>()
  const bucket = (parent: MenuItem | null): Placed[] => {
    let b = buckets.get(parent)
    if (!b) buckets.set(parent, (b = []))
    return b
  }
  for (const placed of placedList) {
    let parent: MenuItem | null = null
    if (placed.parent != null) {
      parent = nodeByKey.get(placed.parent) ?? null
      if (parent == null && isDev) {
        console.warn(`[typebook] menu item "${placed.node.title}" has unknown parent "${placed.parent}"; hoisting to top level`)
      }
    }
    bucket(parent).push(placed)
  }

  const sortBucket = (placed: Placed[]): MenuItem[] =>
    placed.sort((a, b) => a.order - b.order || a.seq - b.seq).map((p) => p.node)

  for (const [parent, placed] of buckets) {
    if (parent != null) parent.items = sortBucket(placed)
  }

  return sortBucket(buckets.get(null) ?? [])
}
