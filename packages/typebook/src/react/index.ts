// React entry — the runtime side of the `snippets()` plugin. The bundler plugin slices each
// `<Snippet>`'s example source and injects it as a `__snippetSource` prop; this `<Snippet>`
// component renders the live example plus that source (no context, no generated file, no fetch).
//
// Deliberately dependency-free beyond React: no syntax highlighting, no design system — so the
// release-scoped package can ship a working `<Snippet>` without the full docs kit.
export {
	Snippet,
	type SnippetProps,
	type SnippetRenderProps,
} from "./Snippet";
