import type { ReactNode } from 'react'
import type { AnyRoute } from '@tanstack/react-router'
import type { RoutePaths } from '@tanstack/router-core'
import type { MenuItemInput, MenuPathBrand } from '../types.js'

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

/**
 * The adapter's return: flat menu items whose `parent` is typed to the tree's
 * route paths, plus a phantom {@link MenuPathBrand} so `defineMenu` can keep
 * `parent` typed across a spread.
 */
export type RouteMenuInput<TRouteTree extends AnyRoute> = Array<
  MenuItemInput<RoutePaths<TRouteTree>> & MenuPathBrand<RoutePaths<TRouteTree>>
>

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
 * Build a flat {@link MenuInput} from a TanStack Router route tree, with each
 * item's `parent` pointing at its nearest navigable ancestor. Spread the result
 * into {@link defineMenu}, where it is resolved into a tree, sorted by `order`,
 * and de-duplicated/overridden by `href`:
 *
 * ```tsx
 * const menu = defineMenu([
 *   ...menuFromRouteTree(routeTree, { omit: ['/about'] }),
 *   // add a custom child into a generated section — `parent` is typed to the routes:
 *   { title: 'Changelog', href: '/changelog', parent: '/components' },
 *   { href: '/button', title: 'Button', icon: <Cube /> }, // overrides the generated item
 * ])
 * ```
 *
 * Traversal rules:
 * - the root and pathless/layout routes (no `path`) are transparent — their
 *   children attach to the nearest navigable ancestor (or the top level);
 * - a route with a `path` becomes an item (`href = fullPath`);
 * - routes in `omit` or with `meta.hidden` are dropped together with their subtree;
 * - `title` resolves to `meta.title` ?? title-cased last segment; `order`/`icon`
 *   come from `meta`.
 */
export function menuFromRouteTree<TRouteTree extends AnyRoute>(
  routeTree: TRouteTree,
  options: MenuFromRouteTreeOptions<TRouteTree> = {},
): RouteMenuInput<TRouteTree> {
  const omit = new Set<string>((options.omit as string[] | undefined) ?? [])
  const getMeta = options.getMeta ?? defaultGetMeta
  const out: MenuItemInput[] = []

  const walk = (route: AnyRoute, parentHref: string | undefined, dropped: boolean): void => {
    const isRoot = (route as { isRoot?: boolean }).isRoot === true
    const path = (route as { path?: string }).path
    const transparent = isRoot || path == null || path === ''

    let childParent = parentHref
    let childDropped = dropped

    if (!transparent) {
      const fullPath = (route as { fullPath: string }).fullPath
      const meta = getMeta(route) ?? {}
      if (omit.has(fullPath) || meta.hidden) {
        childDropped = true // drop this route and its subtree
      } else if (!dropped) {
        const item: MenuItemInput = {
          title: meta.title ?? titleFromPath(fullPath),
          href: fullPath,
        }
        if (parentHref != null) item.parent = parentHref
        if (meta.order != null) item.order = meta.order
        if (meta.icon != null) item.icon = meta.icon
        out.push(item)
        childParent = fullPath
      }
    }

    for (const child of childrenOf(route)) walk(child, childParent, childDropped)
  }

  walk(routeTree, undefined, false)
  return out as unknown as RouteMenuInput<TRouteTree>
}
