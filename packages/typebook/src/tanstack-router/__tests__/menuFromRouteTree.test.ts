import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
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

  // Section: a route with a path AND children → clickable section.
  const components = createRoute({ getParentRoute: () => root, path: 'components' })
  const componentsBadge = createRoute({ getParentRoute: () => components, path: 'badge' })

  // Pathless layout: no `path` → transparent, its children bubble up.
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
  it('mirrors the route tree, dropping root/pathless wrappers', () => {
    const menu = menuFromRouteTree(buildTree())
    const hrefs = menu.map((i) => i.href)
    // '/settings' bubbles up from the pathless `_layout`.
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/button')
    expect(hrefs).toContain('/components')
    expect(hrefs).toContain('/settings')
    expect(hrefs).not.toContain('/_layout')
  })

  it('reads title/order from staticData and falls back to a title-cased segment', () => {
    const menu = menuFromRouteTree(buildTree())
    const button = menu.find((i) => i.href === '/button')
    expect(button).toMatchObject({ title: 'Button', order: 1 })
    const about = menu.find((i) => i.href === '/about')
    expect(about?.title).toBe('About') // derived from segment
  })

  it('nests children of a route that has its own path', () => {
    const menu = menuFromRouteTree(buildTree())
    const components = menu.find((i) => i.href === '/components')
    expect(components?.items?.map((i) => i.href)).toEqual(['/components/badge'])
  })

  it('drops routes flagged hidden in metadata', () => {
    const menu = menuFromRouteTree(buildTree())
    expect(menu.find((i) => i.href === '/hidden')).toBeUndefined()
  })

  it('drops routes (and subtrees) listed in `omit`', () => {
    const menu = menuFromRouteTree(buildTree(), { omit: ['/about', '/components'] })
    const hrefs = menu.map((i) => i.href)
    expect(hrefs).not.toContain('/about')
    expect(hrefs).not.toContain('/components')
  })

  it('honors a custom getMeta', () => {
    const menu = menuFromRouteTree(buildTree(), {
      getMeta: (route) =>
        route.fullPath === '/about' ? { title: 'Custom About', order: 0 } : undefined,
    })
    expect(menu.find((i) => i.href === '/about')).toMatchObject({
      title: 'Custom About',
      order: 0,
    })
  })
})
