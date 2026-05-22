type Size = 'sm' | 'md' | 'lg'
type SizeLabel = `size-${Size}`

export enum Color {
	Red = 'red',
	Blue = 'blue',
	Green = 'green',
}

interface ConditionalProps {
	sizeLabel: SizeLabel
	color: Color
	extracted: Extract<'a' | 'b' | 'c', 'a' | 'b'>
	excluded: Exclude<'a' | 'b' | 'c', 'c'>
}

export function Conditional(props: ConditionalProps) {
	return <div>{props.sizeLabel}</div>
}
