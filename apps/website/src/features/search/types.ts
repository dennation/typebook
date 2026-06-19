/** One entry of the docs search index — a page or a heading inside a page. */
export interface SearchEntry {
	slug: string;
	title: string;
	section: string;
	desc: string;
	/** Anchor id when the entry points at a heading inside a page. */
	heading?: string;
}
