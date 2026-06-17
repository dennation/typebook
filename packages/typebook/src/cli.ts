import { PACKAGE_NAME } from "./constants.js";

/**
 * Typebook no longer generates files. Component prop metadata and snippet sources
 * are injected directly into each `registerComponent()` / `<Snippet>` call by the
 * bundler plugin at build time, so there is nothing to pre-generate from a CLI.
 */
console.log(`
  @dennation/${PACKAGE_NAME}

  This tool runs as a bundler plugin — there is no separate codegen step.
  Add the plugin for your bundler and prop metadata is injected at build time:

    import { typebook } from '@dennation/${PACKAGE_NAME}/vite'
    // also: /rollup, /rolldown, /webpack, /rspack, /esbuild, /farm

    export default defineConfig({ plugins: [typebook()] })
`);
