import type { ReactNode } from "react";

/** The popover state root. */
export function Popover({ children }: { children?: ReactNode }) {
	return <>{children}</>;
}

/** Opens the popover. */
export function PopoverTrigger({ children }: { children?: ReactNode }) {
	return <button type="button">{children}</button>;
}

/**
 * The floating panel.
 * @deprecated Use `Popover` children.
 */
export function PopoverContent({ children }: { children?: ReactNode }) {
	return <div>{children}</div>;
}

/**
 * A panel floating next to an element.
 * @module
 */
