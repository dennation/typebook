interface ComplexUnionProps {
	mixed: string | number
	numLiteral: 1 | 2 | 3
	singleLiteral: 'only'
	boolOrString: boolean | string
	wide: 'a' | 'b' | string
}

export function ComplexUnion(props: ComplexUnionProps) {
	return <div>{props.singleLiteral}</div>
}
