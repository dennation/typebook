import type { SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
	/** Square size in px (sets both width and height). */
	size?: number
	/** Stroke width. */
	sw?: number
}

interface BaseProps extends IconProps {
	d?: string
	children?: React.ReactNode
}

/** Lightweight stroke icons (lucide-style geometry, original paths). */
function I({ d, size = 16, sw = 1.8, fill, children, ...rest }: BaseProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={fill || 'none'}
			stroke="currentColor"
			strokeWidth={sw}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...rest}
		>
			{d ? <path d={d} /> : children}
		</svg>
	)
}

export const Icon = {
	search: (p: IconProps) => (
		<I {...p}>
			<circle cx="11" cy="11" r="7" />
			<path d="m21 21-4.3-4.3" />
		</I>
	),
	sun: (p: IconProps) => (
		<I {...p}>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</I>
	),
	moon: (p: IconProps) => <I {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
	github: (p: IconProps) => (
		<I {...p}>
			<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A5 5 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 0 0-1 2.6V22" />
		</I>
	),
	menu: (p: IconProps) => (
		<I {...p}>
			<path d="M3 6h18M3 12h18M3 18h18" />
		</I>
	),
	chevR: (p: IconProps) => <I {...p} d="m9 6 6 6-6 6" />,
	chevD: (p: IconProps) => <I {...p} d="m6 9 6 6 6-6" />,
	chevL: (p: IconProps) => <I {...p} d="m15 6-6 6 6 6" />,
	copy: (p: IconProps) => (
		<I {...p}>
			<rect x="9" y="9" width="12" height="12" rx="2.5" />
			<path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
		</I>
	),
	check: (p: IconProps) => <I {...p} d="M20 6 9 17l-5-5" />,
	hash: (p: IconProps) => (
		<I {...p}>
			<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
		</I>
	),
	rocket: (p: IconProps) => (
		<I {...p}>
			<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-3 0ZM12 15l-3-3a22 22 0 0 1 8-10c1.5 0 3 1.5 3 3a22 22 0 0 1-10 8M9 12H4s.5-2.8 2-4c1.7-1.3 5 0 5 0M12 15v5s2.8-.5 4-2c1.3-1.7 0-5 0-5" />
		</I>
	),
	book: (p: IconProps) => (
		<I {...p}>
			<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
		</I>
	),
	box: (p: IconProps) => (
		<I {...p}>
			<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
			<path d="m3 8 9 5 9-5M12 13v8" />
		</I>
	),
	cog: (p: IconProps) => (
		<I {...p}>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 .9-1.4V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.4.9H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.4.9Z" />
		</I>
	),
	palette: (p: IconProps) => (
		<I {...p}>
			<circle cx="13.5" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
			<circle cx="17.5" cy="10.5" r="1.3" fill="currentColor" stroke="none" />
			<circle cx="6.5" cy="12.5" r="1.3" fill="currentColor" stroke="none" />
			<circle cx="8.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
			<path d="M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h2a4 4 0 0 0 4-4 10 10 0 0 0-10-8Z" />
		</I>
	),
	info: (p: IconProps) => (
		<I {...p}>
			<circle cx="12" cy="12" r="9.5" />
			<path d="M12 16v-5M12 8h.01" />
		</I>
	),
	warn: (p: IconProps) => (
		<I {...p}>
			<path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3l-8.5-14.7a2 2 0 0 0-3.4 0Z" />
			<path d="M12 9v4M12 17h.01" />
		</I>
	),
	danger: (p: IconProps) => (
		<I {...p}>
			<circle cx="12" cy="12" r="9.5" />
			<path d="m15 9-6 6M9 9l6 6" />
		</I>
	),
	ok: (p: IconProps) => (
		<I {...p}>
			<circle cx="12" cy="12" r="9.5" />
			<path d="m8.5 12 2.5 2.5 5-5" />
		</I>
	),
	link: (p: IconProps) => (
		<I {...p}>
			<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
		</I>
	),
	edit: (p: IconProps) => (
		<I {...p}>
			<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
			<path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
		</I>
	),
	doc: (p: IconProps) => (
		<I {...p}>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
			<path d="M14 2v6h6M9 13h6M9 17h6" />
		</I>
	),
	terminal: (p: IconProps) => (
		<I {...p}>
			<rect x="3" y="4" width="18" height="16" rx="2.5" />
			<path d="m7 9 3 3-3 3M13 15h4" />
		</I>
	),
	react: (p: IconProps) => (
		<I {...p}>
			<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
			<ellipse cx="12" cy="12" rx="10" ry="4" />
			<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
			<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
		</I>
	),
	ts: (p: IconProps) => (
		<I {...p}>
			<rect x="3" y="3" width="18" height="18" rx="3" />
			<path d="M9 12h4M11 12v5M15 16.5c.4.4 1 .6 1.6.6 1 0 1.6-.5 1.6-1.2 0-1.6-3-.9-3-2.6 0-.7.6-1.3 1.6-1.3.5 0 1 .2 1.3.5" />
		</I>
	),
	cmd: (p: IconProps) => (
		<I {...p} d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" />
	),
	arrowUpDown: (p: IconProps) => (
		<I {...p}>
			<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
		</I>
	),
	enter: (p: IconProps) => (
		<I {...p}>
			<path d="M9 10 4 15l5 5" />
			<path d="M20 4v7a4 4 0 0 1-4 4H4" />
		</I>
	),
	layers: (p: IconProps) => (
		<I {...p}>
			<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
		</I>
	),
	zap: (p: IconProps) => <I {...p} d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />,
	type: (p: IconProps) => (
		<I {...p}>
			<path d="M4 7V5h16v2M9 19h6M12 5v14" />
		</I>
	),
} satisfies Record<string, (p: IconProps) => React.ReactElement>

export type IconName = keyof typeof Icon
