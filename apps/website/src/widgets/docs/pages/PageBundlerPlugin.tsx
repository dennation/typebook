import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	MDTable,
	P,
} from "@dennation/typebook/react";

export function PageBundlerPlugin() {
	return (
		<>
			<Lead>
				<C>typebook(config?)</C> is built on unplugin, so the same factory is
				published for every bundler. It reads and oxc-parses each source file
				once, scans for <C>register()</C> calls and <C>{"<Snippet>"}</C> blocks,
				extracts types through the TypeScript Compiler API, and writes the
				generated files.
			</Lead>

			<H2>Per-bundler entries</H2>
			<MDTable
				head={["Bundler", "Import from"]}
				rows={[
					["Vite", <C key="e">@dennation/typebook/vite</C>],
					["Rollup", <C key="e">@dennation/typebook/rollup</C>],
					["Rolldown", <C key="e">@dennation/typebook/rolldown</C>],
					["webpack", <C key="e">@dennation/typebook/webpack</C>],
					["Rspack", <C key="e">@dennation/typebook/rspack</C>],
					["esbuild", <C key="e">@dennation/typebook/esbuild</C>],
					["Farm", <C key="e">@dennation/typebook/farm</C>],
				]}
			/>
			<P>
				Each entry exports the plugin both as the named <C>typebook</C> and as
				the default export, so either import style works.
			</P>

			<H2>Configuration</H2>
			<CodeBlock
				file="vite.config.ts"
				icon={<Icon.ts size={14} />}
				lang="tsx"
				code={`typebook({
  // registryFile: "./src/ui-registry.gen.ts",  // default
  // snippetsFile: "./src/snippets.gen.ts",     // default; created on first <Snippet>
})`}
			/>

			<H2>When generation runs</H2>
			<P>
				The registry is generated in the universal <C>buildStart</C> hook —
				idempotent, re-runs on each rebuild in every bundler. The Vite entry
				additionally watches the dev server for incremental, debounced
				regeneration, since Vite doesn't re-run <C>buildStart</C> per change.
			</P>

			<Callout type="info" title="No bundler at all?">
				<C>npx @dennation/typebook generate</C> runs the same pipeline once from
				the CLI.
			</Callout>
		</>
	);
}
