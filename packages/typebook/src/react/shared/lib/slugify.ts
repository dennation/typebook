/** Turn a heading text into a URL-friendly anchor id. */
export function slugify(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");
}
