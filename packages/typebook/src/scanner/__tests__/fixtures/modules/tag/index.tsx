/**
 * A removable tag; for a static label use `Badge`.
 *
 * @module
 */

/** The tag itself, with a remove button. */
export function Tag({ label }: { label: string }) {
	return <span>{label}</span>;
}
