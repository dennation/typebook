import type { ReactNode } from 'react'
import type { AnyRoute } from '@tanstack/react-router'
import type { RoutePaths } from '@tanstack/router-core'
import type { MenuInput, MenuItemInput } from '../types.js'

/**
 * Per-route menu metadata. Read by the adapter's default `getMeta` from
 * `route.options.staticData.typebook.meta`. Augment your route definitions:
 *
 * ```tsx
 * createFileRoute('/button')({
 *   component: ButtonPage,
 *   staticData: { typebook: { meta: { title: 'Button', order: 1 } } },
 * })
 * ```
 */
export interface TypebookRouteMeta {
  /** Display title. Falls back to a title-cased last path segment. */
  title?: string
  /** Sort hint among siblings (lower first). */
  order?: number
  icon?: ReactNode
  /** Exclude this route (and its subtree) from the menu. */
  hidden?: boolean
}

declare module '@tanstack/router-core' {
  interface StaticDataRouteOption {
    typebook?: { meta?: TypebookRouteMeta }
  }
}

export interface MenuFromRouteTreeOptions<TRouteTree extends AnyRoute> {
  /** Route full-paths to exclude (and their subtrees). Typed against the tree. */
  omit?: RoutePaths<TRouteTree>[]
  /**
   * Where per-route metadata lives. Default reads
   * `route.options.staticData?.typebook?.meta`.
   */
  getMeta?: (route: AnyRoute) => TypebookRouteMeta | undefined
}

function defaultGetMeta(route: AnyRoute): TypebookRouteMeta | undefined {
  const staticData = route.options?.staticData as
    | { typebook?: { meta?: TypebookRouteMeta } }
    | undefined
  return staticData?.typebook?.meta
}

/** Children of a route, normalized to an array (TanStack may store a record). */
function childrenOf(route: AnyRoute): AnyRoute[] {
  const children = (route as { children?: unknown }).children
  if (!children) return []
  return Array.isArray(children) ? children : Object.values(children as Record<string, AnyRoute>)
}

/** Title-case the last non-empty segment of a path (`/user-settings` → `User Settings`). */
function titleFromPath(fullPath: string): string {
  const segment = fullPath.split('/').filter(Boolean).at(-1)
  if (!segment) return 'Home'
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Build a {@link MenuInput} from a TanStack Router route tree by mirroring its
 * hierarchy. The result is meant to be spread into {@link defineMenu}, where it
 * is sorted by `order`, de-duplicated/overridden by `href`, and normalized:
 *
 * ```tsx
 * const menu = defineMenu([
 *   ...menuFromRouteTree(routeTree, { omit: ['/about'] }),
 *   { href: '/button', title: 'Button', icon: <Cube /> }, // overrides on the spot
 *   { title: 'GitHub', href: 'https://github.com/...' },   // appended
 * ])
 * ```
 *
 * Traversal rules:
 * - the root and pathless/layout routes (no `path`) are transparent — their
 *   children bubble up to the parent level;
 * - a route with a `path` becomes an item (`href = fullPath`); with children it
 *   becomes a clickable section;
 * - routes in `omit` or with `meta.hidden` are dropped together with their subtree;
 * - `title` resolves to `meta.title` ?? title-cased last segment; `order`/`icon`
 *   come from `meta`.
 */
export function menuFromRouteTree<TRouteTree extends AnyRoute>(
  routeTree: TRouteTree,
  options: MenuFromRouteTreeOptions<TRouteTree> = {},
): MenuInput {
  const omit = new Set<string>((options.omit as string[] | undefined) ?? [])
  const getMeta = options.getMeta ?? defaultGetMeta

  const emit = (route: AnyRoute): MenuItemInput[] => {
    const childItems = childrenOf(route).flatMap(emit)

    const isRoot = (route as { isRoot?: boolean }).isRoot === true
    const path = (route as { path?: string }).path
    // Root / pathless / layout routes are transparent: lift their children.
    if (isRoot || path == null || path === '') return childItems

    const fullPath = (route as { fullPath: string }).fullPath
    const meta = getMeta(route) ?? {}
    if (omit.has(fullPath) || meta.hidden) return []

    const node: MenuItemInput = {
      title: meta.title ?? titleFromPath(fullPath),
      href: fullPath,
    }
    if (meta.order != null) node.order = meta.order
    if (meta.icon != null) node.icon = meta.icon
    if (childItems.length) node.items = childItems
    return [node]
  }

  return emit(routeTree)
}
