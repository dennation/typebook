/**
 * Generates a JSX code string from a component name and props.
 * Used for the code preview in the Inspect Panel.
 */
export function generateJsx(componentName: string, props: Record<string, unknown>): string {
	const { children, ...rest } = props

	const attrs: string[] = []
	for (const [key, value] of Object.entries(rest)) {
		const formatted = formatPropValue(key, value)
		if (formatted !== null) {
			attrs.push(formatted)
		}
	}

	const childContent = formatChildren(children)
	const multiline = attrs.length > 2 || childContent !== null

	if (multiline) {
		const indentedAttrs = attrs.map((a) => `  ${a}`).join('\n')
		const attrBlock = attrs.length > 0 ? `\n${indentedAttrs}\n` : ''

		if (childContent !== null) {
			return `<${componentName}${attrBlock}>\n  ${childContent}\n</${componentName}>`
		}
		return `<${componentName}${attrBlock}/>`
	}

	const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
	return `<${componentName}${attrStr} />`
}

function formatPropValue(key: string, value: unknown): string | null {
	if (value === undefined) return null
	if (typeof value === 'function') return null

	if (value === true) return key
	if (value === false) return `${key}={false}`
	if (value === null) return `${key}={null}`
	if (typeof value === 'string') return `${key}="${value}"`
	if (typeof value === 'number') return `${key}={${value}}`

	if (typeof value === 'object') {
		try {
			const json = JSON.stringify(value)
			return `${key}={${json}}`
		} catch {
			return `${key}={[object]}`
		}
	}

	return `${key}={${String(value)}}`
}

function formatChildren(value: unknown): string | null {
	if (value === undefined || value === null) return null
	if (typeof value === 'string') return value
	if (typeof value === 'number') return String(value)
	return null
}
