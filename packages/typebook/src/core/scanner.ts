import { resolve } from 'node:path'
import { glob } from 'glob'

/**
 * Find files matching a glob pattern relative to cwd.
 */
export async function findFiles(
  cwd: string,
  includeGlob: string,
): Promise<string[]> {
  return glob(resolve(cwd, includeGlob), { absolute: true })
}

/** Resolved component import: the component argument of `register(id, Component, ...)` */
export interface ComponentImport {
  /** Original exported name in the source module (e.g. `Button`) */
  name: string
  /** Module specifier the component was imported from (e.g. `./components/Button`) */
  path: string
}

/** A single `register(id, Component, ...)` call found in a file */
export interface RegisterCall {
  /** String literal id (first argument) */
  id: string
  /** Resolved component import for the second argument */
  componentImport: ComponentImport
  /** Character offset of the CallExpression in source — used by ts-client to find this exact call */
  callStart: number
}

export interface FileAnalysis {
  registers: RegisterCall[]
}

const REGISTER_NAME = 'register'

async function parseFile(filename: string, content: string): Promise<unknown> {
  const oxc = await import('oxc-parser')
  return oxc.parseSync(filename, content).program
}

/**
 * Quick string check before parsing — most files won't contain register() at all.
 */
export function mayContainRegister(content: string): boolean {
  return content.includes(`${REGISTER_NAME}(`)
}

/**
 * Parse a TypeScript/JSX file and extract every `register(id, Component, ...)`
 * call anywhere in the AST. Imports are resolved so each call carries the
 * originating module path for its component argument.
 *
 * Note: only calls whose first argument is a string literal AND whose second
 * argument is an imported Identifier are kept — locally-declared components
 * can't be referenced from the generated registry.
 */
export async function analyzeFile(filename: string, content: string): Promise<FileAnalysis> {
  const program = await parseFile(filename, content)
  const body = (program as { body: unknown[] }).body

  const imports = new Map<string, ComponentImport>()
  const calls: Array<{ callStart: number; id: string; componentLocal: string }> = []

  for (const node of body as Array<Record<string, unknown>>) {
    if (node.type === 'ImportDeclaration') {
      collectImports(node, imports)
    }
  }

  walk(program, (node) => {
    const match = matchRegisterCall(node)
    if (match !== null) {
      calls.push({
        callStart: (node.start as number) ?? 0,
        id: match.id,
        componentLocal: match.componentLocal,
      })
    }
  })

  const registers: RegisterCall[] = []
  for (const { callStart, id, componentLocal } of calls) {
    const componentImport = imports.get(componentLocal) ?? null
    if (componentImport === null) continue
    registers.push({ id, componentImport, callStart })
  }

  return { registers }
}

/**
 * If `node` is a `register(id, Component, ...)` call where `id` is a string
 * literal and `Component` resolves to an Identifier (directly or through a TS
 * type instantiation `Component<T>`), return the id and the local component
 * name. Otherwise return null.
 */
function matchRegisterCall(
  node: Record<string, unknown>,
): { id: string; componentLocal: string } | null {
  if (node.type !== 'CallExpression') return null
  const callee = node.callee as { type?: string; name?: string } | undefined
  if (callee?.type !== 'Identifier' || callee.name !== REGISTER_NAME) return null

  const args = (node.arguments as Array<Record<string, unknown>>) ?? []
  const id = stringLiteralValue(args[0])
  if (id === null) return null

  const componentLocal = identifierName(args[1])
  if (componentLocal === null) return null

  return { id, componentLocal }
}

/** Read the value of a string Literal node, otherwise null. */
function stringLiteralValue(node: Record<string, unknown> | undefined): string | null {
  if (!node) return null
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}

/**
 * Unwrap `TSInstantiationExpression` (e.g. `Select<T>`) down to the underlying
 * Identifier. Returns null for anything else.
 */
function identifierName(node: Record<string, unknown> | undefined): string | null {
  if (!node) return null
  if (node.type === 'Identifier') return (node.name as string) ?? null
  if (node.type === 'TSInstantiationExpression') {
    return identifierName(node.expression as Record<string, unknown>)
  }
  return null
}

function collectImports(
  node: Record<string, unknown>,
  imports: Map<string, ComponentImport>,
) {
  const source = (node.source as { value?: string } | undefined)?.value ?? ''
  const specifiers = (node.specifiers as Array<Record<string, unknown>>) ?? []

  for (const spec of specifiers) {
    const localName = (spec.local as { name?: string } | undefined)?.name
    if (!localName) continue

    if (spec.type === 'ImportDefaultSpecifier') {
      imports.set(localName, { name: localName, path: source })
    } else if (spec.type === 'ImportSpecifier') {
      const imported = (spec.imported as { name?: string } | undefined)?.name
      imports.set(localName, { name: imported ?? localName, path: source })
    }
  }
}

/**
 * Depth-first AST walk. Visits every object node in the tree (skips primitives,
 * arrays are descended into). Cheap enough for source files — no cycle handling
 * needed since oxc returns a tree, not a graph.
 */
function walk(root: unknown, visit: (node: Record<string, unknown>) => void): void {
  const stack: unknown[] = [root]
  while (stack.length > 0) {
    const current = stack.pop()
    if (current === null || typeof current !== 'object') continue

    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) stack.push(current[i])
      continue
    }

    const node = current as Record<string, unknown>
    if (typeof node.type === 'string') visit(node)

    for (const key in node) {
      if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue
      const value = node[key]
      if (value && typeof value === 'object') stack.push(value)
    }
  }
}
