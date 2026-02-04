import { parseTypeString } from '../src/parser/type-parser.js'

/**
 * Simulates the string that tsgo LSP hover would return
 * for ButtonProps. We test that oxc can parse it into PropInfo[].
 */
const cases: { name: string; input: string }[] = [
  {
    name: 'flat ButtonProps',
    input: `{
      size: 'sm' | 'md' | 'lg';
      variant: 'primary' | 'secondary' | 'ghost';
      disabled?: boolean;
      children: ReactNode;
      onClick?: () => void;
    }`,
  },
  {
    name: 'simple two-field type',
    input: `{ name: string; count: number }`,
  },
  {
    name: 'all optional',
    input: `{ label?: string; active?: boolean; value?: 'a' | 'b' }`,
  },
]

async function run() {
  for (const c of cases) {
    console.log(`\n--- ${c.name} ---`)
    console.log('Input:', c.input.replace(/\s+/g, ' ').trim())

    try {
      const props = await parseTypeString(c.input)
      console.log('Result:', JSON.stringify(props, null, 2))
    } catch (err) {
      console.error('FAILED:', (err as Error).message)
    }
  }
}

run()
