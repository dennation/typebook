import { useEffect } from 'react'

/**
 * Scroll-reveal: toggles the `.in` class on every `.reveal` element as it
 * enters the viewport (the `.reveal/.in` transition pair lives in the
 * typebook design system, theme.css).
 * Falls back to revealing everything when IntersectionObserver is missing.
 */
export function useReveal(): void {
	useEffect(() => {
		const els = document.querySelectorAll('.reveal')
		if (!('IntersectionObserver' in window)) {
			els.forEach((el) => el.classList.add('in'))
			return
		}
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('in')
						io.unobserve(entry.target)
					}
				})
			},
			{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
		)
		els.forEach((el) => io.observe(el))
		return () => io.disconnect()
	}, [])
}
