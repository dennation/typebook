import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: IndexPage,
	staticData: { menu: { meta: { title: 'Home', order: 0 } } },
})

function IndexPage() {
	return (
		<div className="st:p-8">
			<h1 className="st:text-2xl st:font-bold">Basic example</h1>
			<p className="st:mt-2">UI Studio docs with TanStack Router. No MDX, just plain TSX pages.</p>
			<Link to="/"/>
		</div>
	)
}
