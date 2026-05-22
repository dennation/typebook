import { useInsertionEffect } from 'react'
import type { ReactNode } from 'react'
import { STYLE_ELEMENT_ID } from '../../constants.js'
import { useTheme, type Theme } from '../hooks/useTheme.js'
import styles from '../styles/styles.css?inline'

export interface TypebookLayoutProps {
	children: ReactNode
	theme?: Theme
	sidebar?: ReactNode
}

export function TypebookLayout({ children, theme: themeOverride, sidebar }: TypebookLayoutProps) {
	const { theme } = useTheme(themeOverride)

	useInsertionEffect(() => {
		if (document.getElementById(STYLE_ELEMENT_ID)) return
		const style = document.createElement('style')
		style.id = STYLE_ELEMENT_ID
		style.textContent = styles
		document.head.appendChild(style)
	}, [])

	const rootClass = sidebar
		? 'st:grid st:grid-cols-[260px_minmax(0,1fr)] st:h-screen st:m-0 st:p-0 st:box-border st:font-sans st:bg-bg st:text-text'
		: 'st:h-screen st:m-0 st:p-0 st:box-border st:font-sans st:bg-bg st:text-text st:overflow-auto'

	return (
		<div className={rootClass} data-theme={theme}>
			{sidebar}
			<div className={sidebar ? 'st:overflow-auto st:h-full' : ''}>{children}</div>
		</div>
	)
}
