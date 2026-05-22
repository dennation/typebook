interface FullProps {
	a: string
	b: number
	c: boolean
	d?: 'x' | 'y'
}

export function PickedComponent(props: Pick<FullProps, 'a' | 'd'>) {
	return <div>{props.a}</div>
}

export function OmittedComponent(props: Omit<FullProps, 'c'>) {
	return <div>{props.a}</div>
}

export function PartialComponent(props: Partial<FullProps>) {
	return <div>{props.a}</div>
}
