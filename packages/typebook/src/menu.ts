import type { Menu, MenuInput, MenuItem, MenuItemInput } from './types.js'

const UNORDERED = Number.MAX_SAFE_INTEGER

/** Normalize an href for identity comparison (drop trailing slash, keep root). */
function normalizeHref(href: string): string {
  return href.length > 1 && href.endsWith('/') ? href.slice(0, -1) : href
}

/** Strip authoring-only fields and recursively normalize children. */
function toMenuItem(input: MenuItemInput, build: (items: MenuInput) => Menu): MenuItem {
  const { order: _order, items, ...rest } = input
  const node: MenuItem = { ...rest }
  if (items) node.items = build(items)
  return node
}

/**
 * Normalize a {@link MenuInput} into a stored {@link Menu}:
 *
 * - **De-duplicate by `href`** (deep, across the whole tree). On collision the
 *   *last* occurrence fully replaces the earlier one, kept at the *first*
 *   occurrence's position. This is what powers spread-then-override:
 *   `defineMenu([...menuFromRouteTree(tree), { href: '/button', title: 'X' }])`.
 * - **Sort siblings by `order`** (ascending; unordered items keep their relative
 *   order and sort last).
 * - **Strip `order`**, returning a plain `Menu`.
 *
 * Items without an `href` (pure containers) are never de-duplicated.
 */
export function defineMenu(input: MenuInput): Menu {
  // Pass 1: collect winners — last occurrence of each href wins (full replace).
  const winners = new Map<string, MenuItemInput>()
  const collect = (items: MenuInput): void => {
    for (const item of items) {
      if (item.href != null) winners.set(normalizeHref(item.href), item)
      if (item.items) collect(item.items)
    }
  }
  collect(input)

  // Pass 2: rebuild keeping first-occurrence position, dropping later dups.
  const placed = new Set<string>()
  const build = (items: MenuInput): Menu => {
    const entries: { node: MenuItem; order: number; seq: number }[] = []
    let seq = 0
    for (const item of items) {
      let src = item
      if (item.href != null) {
        const key = normalizeHref(item.href)
        if (placed.has(key)) continue
        placed.add(key)
        src = winners.get(key)!
      } else if (process.env.NODE_ENV !== 'production' && !item.items) {
        console.warn('[typebook] menu item has neither `href` nor `items`:', item.title)
      }
      entries.push({ node: toMenuItem(src, build), order: src.order ?? UNORDERED, seq: seq++ })
    }
    return entries
      .sort((a, b) => a.order - b.order || a.seq - b.seq)
      .map((e) => e.node)
  }

  return build(input)
}
