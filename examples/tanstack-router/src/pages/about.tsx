import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
	component: AboutPage,
	staticData: { menu: { meta: { title: 'About', order: 1 } } },
})

function AboutPage() {
	return (
		<div className="st:p-8">
			<h1 className="st:text-2xl st:font-bold">About</h1>
			<p className="st:mt-2">This page is generated from a regular .tsx file via TanStack Router file-based routing.</p>
		</div>
	)
}
