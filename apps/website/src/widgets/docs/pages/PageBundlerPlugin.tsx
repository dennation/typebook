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
				published for every bundler. In its <C>transform</C> hook it oxc-parses
				each module, scans for <C>getComponentMeta()</C> calls and{" "}
				<C>{"<Snippet>"}</C> blocks, extracts types through the TypeScript
				Compiler API, and injects the results back into the module.
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
  // inheritedProviders: ["@heroui/theme"],  // mark props from these packages as inherited
})`}
			/>

			<H2>When injection runs</H2>
			<P>
				Injection happens per module in the universal <C>transform</C> hook (
				<C>enforce: "pre"</C>), so it works in every bundler and re-runs through
				normal module invalidation. A single warm TypeScript program does the
				extraction; the Vite entry keeps it fresh by notifying it of dev-server
				file changes.
			</P>

			<Callout type="info" title="Type-checks without a build">
				Because the data is injected (not required as an import), plain{" "}
				<C>tsc</C> and tests pass without running the plugin — handles just
				carry an empty <C>props</C> until a build runs.
			</Callout>
		</>
	);
}
