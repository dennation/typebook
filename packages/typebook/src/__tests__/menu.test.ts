import { describe, expect, it } from 'vitest'
import { defineMenu } from '../menu.js'

describe('defineMenu', () => {
  it('keeps array order when no `order` is given', () => {
    const menu = defineMenu([
      { title: 'Home', href: '/' },
      { title: 'About', href: '/about' },
    ])
    expect(menu.map((i) => i.href)).toEqual(['/', '/about'])
  })

  it('sorts siblings by `order` and strips it', () => {
    const menu = defineMenu([
      { title: 'B', href: '/b', order: 2 },
      { title: 'A', href: '/a', order: 1 },
    ])
    expect(menu.map((i) => i.title)).toEqual(['A', 'B'])
    expect(menu[0]).not.toHaveProperty('order')
  })

  it('places unordered items after ordered ones, keeping their relative order', () => {
    const menu = defineMenu([
      { title: 'Plain1', href: '/p1' },
      { title: 'Ordered', href: '/o', order: 1 },
      { title: 'Plain2', href: '/p2' },
    ])
    expect(menu.map((i) => i.title)).toEqual(['Ordered', 'Plain1', 'Plain2'])
  })

  it('de-duplicates by href: later fully replaces earlier, at first position', () => {
    const menu = defineMenu([
      { title: 'Button', href: '/button' },
      { title: 'About', href: '/about' },
      { title: 'Button (override)', href: '/button', icon: 'icon' },
    ])
    expect(menu).toHaveLength(2)
    expect(menu.map((i) => i.href)).toEqual(['/button', '/about'])
    expect(menu[0]).toMatchObject({ title: 'Button (override)', icon: 'icon' })
  })

  it('full replacement drops fields not present on the later item', () => {
    const menu = defineMenu([
      { title: 'Button', href: '/button', items: [{ title: 'Child', href: '/button/child' }] },
      { title: 'Button', href: '/button' },
    ])
    expect(menu[0].items).toBeUndefined()
  })

  it('overrides nested items from a top-level duplicate, kept in place', () => {
    const menu = defineMenu([
      { title: 'Components', items: [{ title: 'Button', href: '/button' }] },
      { title: 'New title', href: '/button' },
    ])
    expect(menu).toHaveLength(1)
    expect(menu[0].items?.[0].title).toBe('New title')
  })

  it('normalizes trailing slashes for identity (keeps root)', () => {
    const menu = defineMenu([
      { title: 'Docs', href: '/docs' },
      { title: 'Docs override', href: '/docs/' },
    ])
    expect(menu).toHaveLength(1)
    expect(menu[0].title).toBe('Docs override')
  })

  it('never de-duplicates hrefless containers', () => {
    const menu = defineMenu([
      { title: 'Group A', items: [] },
      { title: 'Group B', items: [] },
    ])
    expect(menu).toHaveLength(2)
  })
})
