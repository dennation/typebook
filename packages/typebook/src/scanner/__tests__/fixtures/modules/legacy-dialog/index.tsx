import type { ReactNode } from "react";

/**
 * A modal dialog.
 * @deprecated Use `Sheet`.
 */
export function Dialog({ open = false }: { open?: boolean }) {
	return <dialog open={open} />;
}

/** @deprecated Use `Sheet.Close`. */
export function DialogClose({ children }: { children?: ReactNode }) {
	return <button type="button">{children}</button>;
}
