import type { ReactNode } from "react";

/** Native form and the grid container for `Form.Field`. */
function FormRoot({
	size = "sm",
	children,
}: {
	/** Size of the fields inside. */
	size?: "sm" | "md";
	children?: ReactNode;
}) {
	return <form data-size={size}>{children}</form>;
}

/** Input with a label and an error. */
function FormInput({
	label,
}: {
	/** Label text. */
	label?: ReactNode;
}) {
	return <input aria-label={String(label)} />;
}

/**
 * A free grid area.
 * @deprecated Use `Form.Root` columns.
 */
function FormGrid({ children }: { children?: ReactNode }) {
	return <div>{children}</div>;
}

export const Form = { Root: FormRoot, Input: FormInput, Grid: FormGrid };
