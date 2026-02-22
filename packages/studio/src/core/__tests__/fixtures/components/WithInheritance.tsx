interface BaseProps {
	id: string
	className?: string
}

interface ExtendedButtonProps extends BaseProps {
	variant: 'primary' | 'secondary'
	disabled?: boolean
}

export function ExtendedButton(props: ExtendedButtonProps) {
	return <button id={props.id}>{props.variant}</button>
}

type IntersectionLinkProps = BaseProps & {
	href: string
	target?: '_blank' | '_self'
}

export function IntersectionLink(props: IntersectionLinkProps) {
	return <a href={props.href}>{props.id}</a>
}
