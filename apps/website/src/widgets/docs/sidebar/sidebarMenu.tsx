import type {
	MenuComponents,
	MenuContainerProps,
	MenuItemProps,
} from "@dennation/menu/react";
import { cx } from "@dennation/typebook/react";
import { Link } from "@tanstack/react-router";
import type { DocsMeta } from "../../../entities/docs/nav";

/*
 * The `@dennation/menu` render components for the docs sidebar. The renderer
 * owns the recursion; the link, its styling and the active state live here —
 * the project's concern, talking to its own router (TanStack `<Link>`).
 */

const item =
	"relative flex items-center gap-2.25 text-[13.5px] px-2.5 py-1.5 rounded-[7px] no-underline transition-colors duration-130";
const itemActive = "text-accent bg-accent-soft font-medium";
const itemInactive =
	"text-fg-muted font-[450] hover:text-fg hover:bg-bg-tertiary";
const dot = "w-1.25 h-1.25 rounded-[99px] bg-current shrink-0 ml-1";
const badge =
	"ml-auto text-[10px] font-mono px-1.5 py-px rounded-[99px] font-medium bg-accent-soft text-accent border border-accent-soft-border";

/** A single navigation link. Active highlight comes from the router. */
function Item({ item: entry }: MenuItemProps<DocsMeta | undefined>) {
	const href = entry.href;
	if (!href) return null;
	return (
		<Link
			// Data-driven href; every key is a real /docs/<slug> route.
			to={href as "/docs"}
			className={item}
			activeProps={{ className: itemActive }}
			inactiveProps={{ className: itemInactive }}
			activeOptions={{ exact: true }}
		>
			{({ isActive }) => (
				<>
					<span className={cx(dot, isActive ? "opacity-100" : "opacity-30")} />
					{entry.title}
					{entry.meta?.badge && (
						<span className={badge}>{entry.meta.badge}</span>
					)}
				</>
			)}
		</Link>
	);
}

/** Wraps one section's items. */
function Container({ children }: MenuContainerProps) {
	return <div className="flex flex-col gap-px">{children}</div>;
}

export const sidebarMenu: MenuComponents<DocsMeta | undefined> = {
	Container,
	Item,
};
