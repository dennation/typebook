import { Fragment, memo, type ReactNode } from "react";

/** The tabs container. */
function TabsRoot({
	size = "md",
	children,
}: {
	size?: "sm" | "md";
	children?: ReactNode;
}) {
	return <div data-size={size}>{children}</div>;
}

/**
 * One tab.
 * @remarks Put it inside `Tabs.Root`.
 */
function TabsTab({
	value,
	disabled = false,
}: {
	value: string;
	disabled?: boolean;
}) {
	return <button disabled={disabled}>{value}</button>;
}

/** An object namespace: the export itself is not a component, each member is. `Fragment` is a
 * foreign component (declared in `@types/react`) — kept, with `file` pointing there. */
export const Tabs = {
	Root: TabsRoot,
	Tab: TabsTab,
	Frag: Fragment,
	TabsTab,
	inline: ({ label = "x" }: { label?: string }) => <span>{label}</span>,
};

/** `Object.assign(Root, members)`: the export is a component AND has members. */
export const Card = Object.assign(TabsRoot, { Header: TabsTab });

/** Expando: a member assigned onto a function declaration. */
export function Menu({ children }: { children?: ReactNode }) {
	return <ul>{children}</ul>;
}
Menu.Item = TabsTab;

/** `memo(X)` has a `.type` property from `@types/react` — not a member of the author's compound. */
export const Memoized = memo(TabsRoot);
