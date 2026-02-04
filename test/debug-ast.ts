import { parseSync } from 'oxc-parser'

const source = `type T = { size: 'sm' | 'md' | 'lg' }`
const result = parseSync('virtual.ts', source)
const ast: any = result.program

const member = ast.body[0].typeAnnotation.members[0]
const typeAnnotation = member.typeAnnotation.typeAnnotation

console.log('Union node:', JSON.stringify(typeAnnotation, null, 2))
