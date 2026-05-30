import { NPM_PACKAGE_NAME } from '../constants.js'
import { parseProgram, walk } from './ast.js'

/** Resolved component import: the component argument of `registerComponent(id, Component, ...)` */
export interface ComponentImport {
  /** Original exported name in the source module (e.g. `Button`) */
  name: string
  /** Module specifier the component was imported from (e.g. `./components/Button`) */
  path: string
}

/** A single `registerComponent(id, Component, ...)` call found in a file */
export interface RegisterCall {
  /** String literal id (first argument) */
  id: string
  /** Resolved component import for the second argument */
  componentImport: ComponentImport
  /** Character offset of the CallExpression in source — used by ts-client to find this exact call */
  callStart: number
}

const REGISTER_FN_NAME = 'registerComponent'

/**
 * Quick string check before parsing — most files won't contain registerComponent() at all.
 */
export function mayContainRegistration(content: string): boolean {
  return content.includes(`${REGISTER_FN_NAME}(`)
}

/**
 * Parse a TypeScript/JSX file and extract every `registerComponent(id, Component, ...)`
 * call that was imported from `@dennation/typebook`. Imports are resolved so each call
 * carries the originating module path for its component argument.
 *
 * Only calls whose first argument is a string literal AND whose second argument is an
 * imported Identifier are kept — locally-declared components can't be referenced from
 * the generated registry.
 */
export async function scanRegistrations(filename: string, content: string): Promise<RegisterCall[]> {
  const program = await parseProgram(filename, content)
  const body = (program as { body: unknown[] }).body

  const componentImports = new Map<string, ComponentImport>()
  const registerLocalNames = new Set<string>()

  for (const node of body as Array<Record<string, unknown>>) {
    if (node.type !== 'ImportDeclaration') continue
    const source = (node.source as { value?: string } | undefined)?.value ?? ''
    const specifiers = (node.specifiers as Array<Record<string, unknown>>) ?? []

    if (source === NPM_PACKAGE_NAME) {
      collectRegisterNames(specifiers, registerLocalNames)
    } else {
      collectComponentImports(specifiers, source, componentImports)
    }
  }

  const registers: RegisterCall[] = []
  walk(program, (node) => {
    const match = matchRegisterCall(node, registerLocalNames)
    if (match === null) return

    const componentImport = componentImports.get(match.componentLocal) ?? null
    if (componentImport === null) return

    registers.push({ id: match.id, componentImport, callStart: (node.start as number) ?? 0 })
  })

  return registers
}

/**
 * Collect local names that refer to `registerComponent` from `@dennation/typebook`.
 * Handles aliasing: `import { registerComponent as reg } from '@dennation/typebook'`
 * adds 'reg' to the set.
 */
function collectRegisterNames(
  specifiers: Array<Record<string, unknown>>,
  out: Set<string>,
): void {
  for (const spec of specifiers) {
    if (spec.type !== 'ImportSpecifier') continue
    const imported = (spec.imported as { name?: string } | undefined)?.name
    if (imported !== REGISTER_FN_NAME) continue
    const localName = (spec.local as { name?: string } | undefined)?.name
    if (localName) out.add(localName)
  }
}

function collectComponentImports(
  specifiers: Array<Record<string, unknown>>,
  source: string,
  out: Map<string, ComponentImport>,
): void {
  for (const spec of specifiers) {
    const localName = (spec.local as { name?: string } | undefined)?.name
    if (!localName) continue

    if (spec.type === 'ImportDefaultSpecifier') {
      out.set(localName, { name: localName, path: source })
    } else if (spec.type === 'ImportSpecifier') {
      const imported = (spec.imported as { name?: string } | undefined)?.name
      out.set(localName, { name: imported ?? localName, path: source })
    }
  }
}

function matchRegisterCall(
  node: Record<string, unknown>,
  registerLocalNames: Set<string>,
): { id: string; componentLocal: string } | null {
  if (node.type !== 'CallExpression') return null
  const callee = node.callee as { type?: string; name?: string } | undefined
  if (callee?.type !== 'Identifier' || !callee.name || !registerLocalNames.has(callee.name)) return null

  const args = (node.arguments as Array<Record<string, unknown>>) ?? []
  const id = stringLiteralValue(args[0])
  if (id === null) return null

  const componentLocal = identifierName(args[1])
  if (componentLocal === null) return null

  return { id, componentLocal }
}

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
