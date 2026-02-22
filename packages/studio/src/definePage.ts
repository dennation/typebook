import type { PageConfig, PageResult } from './types.js'

export function definePage(config: PageConfig): PageResult {
  return {
    __type: 'page',
    name: config.name,
    path: config.path,
    order: config.order,
    content: config.content,
  }
}
