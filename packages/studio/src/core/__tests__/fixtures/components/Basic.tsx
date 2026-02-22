interface BasicProps {
	size: 'sm' | 'md' | 'lg'
	variant?: 'solid' | 'outline' | 'ghost'
	disabled?: boolean
	label: string
	count?: number
}

export function Basic(props: BasicProps) {
	return <div>{props.label}</div>
}
