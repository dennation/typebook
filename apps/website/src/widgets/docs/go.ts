/** In-docs navigation: switch page (and optionally jump to a heading). */
export type DocsGo = (slug: string, heading?: string) => void;

export interface DocsHeading {
	id: string;
	text: string;
	level: 2 | 3;
}
