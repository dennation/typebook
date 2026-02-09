import type { PropInfo, PropType } from '../types.js'
import { LOG_PREFIX } from '../constants.js'

/**
 * Parses a type string returned by tsgo LSP hover
 * into structured PropInfo[].
 *
 * Example input (from LSP hover):
 *   "{ size?: 'sm' | 'md' | 'lg'; variant: 'primary' | 'secondary'; disabled?: boolean; children: ReactNode; onClick?: () => void }"
 *
 * Strategy: wrap in "type T = {...}" and parse via oxc.
 */
export async function parseTypeString(raw: string): Promise<PropInfo[]> {
  const oxc = await import('oxc-parser')

  // Normalize: ensure it's a type declaration oxc can parse
  const typeDecl = raw.startsWith('{') ? `type T = ${raw}` : `type T = { ${raw} }`
  const result = oxc.parseSync('virtual.ts', typeDecl)
  const ast: any = result.program

  const props: PropInfo[] = []

  // Find the type alias declaration
  for (const node of ast.body) {
    if (node.type !== 'TSTypeAliasDeclaration') continue

    const typeAnnotation = node.typeAnnotation
    if (!typeAnnotation) continue

    const members = extractMembers(typeAnnotation)
    for (const member of members) {
      props.push(member)
    }
  }

  return props
}

function extractMembers(node: any): PropInfo[] {
  if (!node) return []

  // TSTypeLiteral — { prop: type; ... }
  if (node.type === 'TSTypeLiteral') {
    return (node.members ?? [])
      .filter((m: any) => m.type === 'TSPropertySignature')
      .map((m: any) => parseMember(m))
      .filter(Boolean) as PropInfo[]
  }

  // TSIntersectionType — Type1 & Type2
  if (node.type === 'TSIntersectionType') {
    return (node.types ?? []).flatMap((t: any) => extractMembers(t))
  }

  return []
}

function parseMember(member: any): PropInfo | null {
  const key = member.key?.name ?? member.key?.value
  if (!key) return null

  const optional = member.optional === true
  const typeAnnotation = member.typeAnnotation?.typeAnnotation

  return {
    name: key,
    optional,
    type: resolveType(typeAnnotation),
  }
}

function resolveType(node: any): PropType {
  if (!node) return { kind: 'unknown', raw: '' }

  switch (node.type) {
    // Union type: 'a' | 'b' | 'c'
    case 'TSUnionType': {
      const types = node.types ?? []

      // oxc represents all literals as { type: 'Literal', value: ... }
      const allStringLiterals = types.every(
        (t: any) =>
          t.type === 'TSLiteralType' &&
          typeof t.literal?.value === 'string',
      )
      if (allStringLiterals) {
        return {
          kind: 'literal',
          values: types.map((t: any) => t.literal.value),
        }
      }

      const allBooleans = types.every(
        (t: any) =>
          t.type === 'TSLiteralType' &&
          typeof t.literal?.value === 'boolean',
      )
      if (allBooleans) {
        return { kind: 'boolean' }
      }

      return {
        kind: 'unknown',
        raw: types.map(() => '...').join(' | '),
      }
    }

    // Literal types
    case 'TSLiteralType': {
      const literal = node.literal
      if (typeof literal?.value === 'string') {
        return { kind: 'literal', values: [literal.value] }
      }
      if (typeof literal?.value === 'boolean') {
        return { kind: 'boolean' }
      }
      if (typeof literal?.value === 'number') {
        return { kind: 'number' }
      }
      return { kind: 'unknown', raw: JSON.stringify(literal?.value) }
    }

    // Primitives
    case 'TSBooleanKeyword':
      return { kind: 'boolean' }
    case 'TSStringKeyword':
      return { kind: 'string' }
    case 'TSNumberKeyword':
      return { kind: 'number' }

    // React types
    case 'TSTypeReference': {
      const name = node.typeName?.name
      if (name === 'ReactNode' || name === 'ReactElement' || name === 'JSX') {
        return { kind: 'node' }
      }
      return { kind: 'unknown', raw: name ?? '' }
    }

    // Function types
    case 'TSFunctionType':
      return { kind: 'function' }

    default:
      return { kind: 'unknown', raw: node.type ?? '' }
  }
}

/**
 * Attempts to parse a raw type string.
 * Returns null if parsing fails (for error tolerance).
 */
export async function tryParseTypeString(
  raw: string,
): Promise<PropInfo[] | null> {
  try {
    return await parseTypeString(raw)
  } catch (err) {
    console.error(LOG_PREFIX, 'Failed to parse type string:', raw, err)
    return null
  }
}
