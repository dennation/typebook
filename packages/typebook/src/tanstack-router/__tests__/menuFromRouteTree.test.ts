import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { defineMenu } from '../../menu.js'
import { menuFromRouteTree } from '../index.js'

/** Build an initialized route tree (router init populates `fullPath`). */
function buildTree() {
  const root = createRootRoute()

  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const about = createRoute({ getParentRoute: () => root, path: 'about' })
  const button = createRoute({
    getParentRoute: () => root,
    path: 'button',
    staticData: { typebook: { meta: { title: 'Button', order: 1 } } },
  })
  const hidden = createRoute({
    getParentRoute: () => root,
    path: 'hidden',
    staticData: { typebook: { meta: { hidden: true } } },
  })

  // Section: a route with a path AND children.
  const components = createRoute({ getParentRoute: () => root, path: 'components' })
  const componentsBadge = createRoute({ getParentRoute: () => components, path: 'badge' })

  // Pathless layout: no `path` → transparent, its children attach to the root.
  const layout = createRoute({ getParentRoute: () => root, id: '_layout' })
  const settings = createRoute({ getParentRoute: () => layout, path: 'settings' })

  const routeTree = root.addChildren([
    index,
    about,
    button,
    hidden,
    components.addChildren([componentsBadge]),
    layout.addChildren([settings]),
  ])

  createRouter({ routeTree })
  return routeTree
}

describe('menuFromRouteTree', () => {
  it('emits a flat list with `parent` set to the nearest navigable ancestor', () => {
    const items = menuFromRouteTree(buildTree())
    const byHref = Object.fromEntries(items.map((i) => [i.href, i]))
    expect(byHref['/components/badge'].parent).toBe('/components')
    // Bubbled up from the pathless `_layout` → no parent.
    expect(byHref['/settings'].parent).toBeUndefined()
    expect(byHref['/'].parent).toBeUndefined()
  })

  it('reads title/order from staticData, falls back to a title-cased segment', () => {
    const items = menuFromRouteTree(buildTree())
    const button = items.find((i) => i.href === '/button')
    expect(button).toMatchObject({ title: 'Button', order: 1 })
    expect(items.find((i) => i.href === '/about')?.title).toBe('About')
  })

  it('drops routes flagged hidden, and `omit`s with their subtree', () => {
    const items = menuFromRouteTree(buildTree(), { omit: ['/components'] })
    const hrefs = items.map((i) => i.href)
    expect(hrefs).not.toContain('/hidden')
    expect(hrefs).not.toContain('/components')
    expect(hrefs).not.toContain('/components/badge') // subtree dropped
  })

  it('composes into a nested tree via defineMenu', () => {
    const menu = defineMenu(menuFromRouteTree(buildTree()))
    const components = menu.find((i) => i.href === '/components')
    expect(components?.items?.map((i) => i.href)).toEqual(['/components/badge'])
    expect(menu.find((i) => i.href === '/_layout')).toBeUndefined()
  })

  it('lets a custom child be injected into a generated section', () => {
    const menu = defineMenu([
      ...menuFromRouteTree(buildTree()),
      { title: 'Changelog', href: '/changelog', parent: '/components' },
    ])
    const components = menu.find((i) => i.href === '/components')
    expect(components?.items?.map((i) => i.href)).toEqual(['/components/badge', '/changelog'])
  })

  it('honors a custom getMeta', () => {
    const items = menuFromRouteTree(buildTree(), {
      getMeta: (route) =>
        route.fullPath === '/about' ? { title: 'Custom About', order: 0 } : undefined,
    })
    expect(items.find((i) => i.href === '/about')).toMatchObject({
      title: 'Custom About',
      order: 0,
    })
  })
})
