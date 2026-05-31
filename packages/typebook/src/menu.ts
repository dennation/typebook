import type { Menu, MenuItem, MenuItemInput, MenuPathBrand } from './types.js'

const UNORDERED = Number.MAX_SAFE_INTEGER

// ── Type machinery: constrain `parent` to keys that exist in the same list ──

/** The key (href ?? id) contributed by one input element, when written inline. */
type KeyOf<I> =
  | (I extends { href: infer H extends string } ? H : never)
  | (I extends { id: infer D extends string } ? D : never)

/** Union of inline keys across the tuple. */
type KeysOf<T extends readonly unknown[]> = { [I in keyof T]: KeyOf<T[I]> }[number]

/** Union of route paths carried by adapter-branded elements (survives a spread). */
type PathsOf<T extends readonly unknown[]> = {
  [I in keyof T]: T[I] extends MenuPathBrand<infer P> ? P : never
}[number]

/** All keys valid as a `parent` within the list. */
type MenuKeys<T extends readonly unknown[]> = KeysOf<T> | PathsOf<T>

/**
 * The `parent` constraint. Degrades to `string` when no keys can be inferred
 * (a dynamically-typed `MenuItemInput[]`), so building a menu from runtime data
 * still type-checks; literal tuples keep the precise key union.
 */
type AllowedParent<T extends readonly unknown[]> = [MenuKeys<T>] extends [never]
  ? string
  : MenuKeys<T>

/** Normalize an href for identity comparison (drop trailing slash, keep root). */
function normalizeHref(href: string): string {
  return href.length > 1 && href.endsWith('/') ? href.slice(0, -1) : href
}

function keyOf(item: MenuItemInput): string | undefined {
  return item.href != null ? normalizeHref(item.href) : item.id
}

/** Strip input-only fields, producing a bare output node (children added later). */
function toMenuItem(input: MenuItemInput): MenuItem {
  const { id: _id, parent: _parent, order: _order, ...rest } = input
  return { ...rest }
}

/**
 * Resolve a flat {@link MenuInput} into a nested {@link Menu}:
 *
 * - **De-duplicate by `href`/`id`** — the *last* occurrence fully replaces the
 *   earlier one, kept at the first occurrence's position. This powers
 *   spread-then-override: `defineMenu([...menuFromRouteTree(tree), { href: '/x' }])`.
 * - **Resolve `parent`** (an `href` or `id`) into the nested tree. Items with no
 *   `parent` are top level; an unknown `parent` hoists the item to the top level
 *   (with a dev warning).
 * - **Sort siblings by `order`** (ascending; unordered keep insertion order, last).
 * - **Strip** `id` / `parent` / `order`, returning a plain `Menu`.
 *
 * `parent` is type-checked to only accept keys present in the same list,
 * including route paths flowing in from a branded router adapter.
 */
export function defineMenu<const T extends readonly MenuItemInput<AllowedParent<T>>[]>(
  items: T,
): Menu {
  const isDev = process.env.NODE_ENV !== 'production'
  const list = items as readonly MenuItemInput[]

  // Pass 1: de-duplicate by key (last wins, full replace; keep first position).
  interface Entry {
    input: MenuItemInput
    seq: number
  }
  const entries: Entry[] = []
  const entryByKey = new Map<string, Entry>()
  list.forEach((input, seq) => {
    const key = keyOf(input)
    const existing = key != null ? entryByKey.get(key) : undefined
    if (existing) {
      existing.input = input // full replacement, keep first seq
      return
    }
    const entry: Entry = { input, seq }
    entries.push(entry)
    if (key != null) entryByKey.set(key, entry)
  })

  // Pass 2: build nodes and bucket them under their resolved parent.
  const nodeByKey = new Map<string, MenuItem>()
  interface Placed {
    node: MenuItem
    order: number
    seq: number
  }
  const buckets = new Map<MenuItem | null, Placed[]>()
  const bucket = (parent: MenuItem | null): Placed[] => {
    let b = buckets.get(parent)
    if (!b) buckets.set(parent, (b = []))
    return b
  }

  const nodes = entries.map((entry) => {
    const node = toMenuItem(entry.input)
    const key = keyOf(entry.input)
    if (key != null) nodeByKey.set(key, node)
    return { entry, node }
  })

  for (const { entry, node } of nodes) {
    const parentKey = entry.input.parent != null ? normalizeHref(entry.input.parent) : undefined
    let parent: MenuItem | null = null
    if (parentKey != null) {
      parent = nodeByKey.get(parentKey) ?? null
      if (parent == null && isDev) {
        console.warn(`[typebook] menu item "${entry.input.title}" has unknown parent "${entry.input.parent}"; hoisting to top level`)
      }
    }
    bucket(parent).push({ node, order: entry.input.order ?? UNORDERED, seq: entry.seq })
  }

  const sortBucket = (placed: Placed[]): MenuItem[] =>
    placed.sort((a, b) => a.order - b.order || a.seq - b.seq).map((p) => p.node)

  for (const [parent, placed] of buckets) {
    if (parent != null) parent.items = sortBucket(placed)
  }

  return sortBucket(buckets.get(null) ?? [])
}
