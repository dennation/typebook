/** A clickable button. */
export function Button({ size = "md" }: { size?: "sm" | "md" }) {
	return <button type="button" data-size={size} />;
}
