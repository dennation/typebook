import { describe, expect, it, vi } from 'vitest'
import { defineMenu } from '../menu.js'
import type { MenuInput } from '../types.js'

describe('defineMenu', () => {
  it('keeps insertion order for top-level items without `order`', () => {
    const menu = defineMenu([
      { title: 'Home', href: '/' },
      { title: 'About', href: '/about' },
    ])
    expect(menu.map((i) => i.href)).toEqual(['/', '/about'])
  })

  it('sorts siblings by `order` and strips input-only fields', () => {
    const menu = defineMenu([
      { title: 'B', href: '/b', order: 2 },
      { title: 'A', href: '/a', order: 1 },
    ])
    expect(menu.map((i) => i.title)).toEqual(['A', 'B'])
    expect(menu[0]).not.toHaveProperty('order')
    expect(menu[0]).not.toHaveProperty('parent')
  })

  it('places unordered items after ordered ones, keeping insertion order', () => {
    const menu = defineMenu([
      { title: 'Plain1', href: '/p1' },
      { title: 'Ordered', href: '/o', order: 1 },
      { title: 'Plain2', href: '/p2' },
    ])
    expect(menu.map((i) => i.title)).toEqual(['Ordered', 'Plain1', 'Plain2'])
  })

  it('resolves `parent` (href) into a nested tree', () => {
    const menu = defineMenu([
      { title: 'Components', href: '/components' },
      { title: 'Button', href: '/button', parent: '/components' },
    ])
    expect(menu).toHaveLength(1)
    expect(menu[0].items?.map((i) => i.href)).toEqual(['/button'])
  })

  it('resolves `parent` referencing an hrefless container by `id`', () => {
    const menu = defineMenu([
      { title: 'Group', id: 'grp' },
      { title: 'Child', href: '/c', parent: 'grp' },
    ])
    expect(menu).toHaveLength(1)
    expect(menu[0].href).toBeUndefined()
    expect(menu[0].items?.[0].href).toBe('/c')
  })

  it('hoists items with an unknown parent to the top level (with a warning)', () => {
    // Unknown-parent literals are a compile error; the runtime safety net is for
    // dynamically built menus where `parent` widens to `string`.
    const input: MenuInput = [{ title: 'Orphan', href: '/o', parent: '/missing' }]
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const menu = defineMenu(input)
    expect(menu.map((i) => i.href)).toEqual(['/o'])
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('de-duplicates by href: later fully replaces earlier, at first position', () => {
    const menu = defineMenu([
      { title: 'Button', href: '/button' },
      { title: 'About', href: '/about' },
      { title: 'Button (override)', href: '/button', icon: 'icon' },
    ])
    expect(menu.map((i) => i.href)).toEqual(['/button', '/about'])
    expect(menu[0]).toMatchObject({ title: 'Button (override)', icon: 'icon' })
  })

  it('normalizes trailing slashes for identity and parent matching (keeps root)', () => {
    // Trailing-slash normalization is a runtime convenience (the type-level key
    // is the exact href); exercise it via a dynamically-typed input.
    const input: MenuInput = [
      { title: 'Docs', href: '/docs/' },
      { title: 'Intro', href: '/docs/intro', parent: '/docs' },
    ]
    const menu = defineMenu(input)
    expect(menu).toHaveLength(1)
    expect(menu[0].items?.[0].href).toBe('/docs/intro')
  })

  it('lets a later flat item attach into an earlier section (custom child)', () => {
    const menu = defineMenu([
      { title: 'Components', href: '/components' },
      { title: 'Button', href: '/button', parent: '/components' },
      { title: 'Custom', href: '/x', parent: '/components' },
    ])
    expect(menu[0].items?.map((i) => i.href)).toEqual(['/button', '/x'])
  })
})
