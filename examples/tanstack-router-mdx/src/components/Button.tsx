export interface ButtonProps {
	children: React.ReactNode
	size?: 'sm' | 'md' | 'lg'
	variant?: 'solid' | 'outline' | 'ghost'
	color?: 'primary' | 'secondary' | 'danger'
	disabled?: boolean
}

const sizeStyles: Record<string, string> = {
	sm: 'padding: 4px 8px; font-size: 12px;',
	md: 'padding: 8px 16px; font-size: 14px;',
	lg: 'padding: 12px 24px; font-size: 16px;',
}

const colorMap: Record<string, string> = {
	primary: '#2563eb',
	secondary: '#6b7280',
	danger: '#dc2626',
}

export function Button({
	children,
	size = 'md',
	variant = 'solid',
	color = 'primary',
	disabled = false,
}: ButtonProps) {
	const c = colorMap[color] ?? colorMap.primary
	const base = `border-radius: 6px; cursor: pointer; font-weight: 500; ${sizeStyles[size] ?? sizeStyles.md}`

	const variantStyle =
		variant === 'solid'
			? `background: ${c}; color: white; border: none;`
			: variant === 'outline'
				? `background: transparent; color: ${c}; border: 2px solid ${c};`
				: `background: transparent; color: ${c}; border: none;`

	return (
		<button
			style={Object.assign(
				{},
				...`${base} ${variantStyle} ${disabled ? 'opacity: 0.5; pointer-events: none;' : ''}`.split(';').filter(Boolean).map((s) => {
					const [k, v] = s.split(':').map((p) => p.trim())
					if (!k || !v) return {}
					const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
					return { [camel]: v }
				}),
			)}
			disabled={disabled}
			type="button"
		>
			{children}
		</button>
	)
}
