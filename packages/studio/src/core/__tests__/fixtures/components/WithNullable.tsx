interface NullableProps {
	value: string | null
	status?: 'active' | 'inactive' | undefined
	data: number | null | undefined
	flag: boolean | null
}

export function Nullable(props: NullableProps) {
	return <div>{props.value}</div>
}
