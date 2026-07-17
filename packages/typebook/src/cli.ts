import { PACKAGE_NAME } from "./constants";

/**
 * There is no codegen step: `typebook()` runs as a bundler plugin that scans the configured
 * components and lets its sub-plugins emit artifacts at build time. This CLI only prints how to wire
 * it up.
 */
console.log(`
  @dennation/${PACKAGE_NAME}

  This tool runs as a bundler plugin — there is no separate codegen step.
  Add the plugin for your bundler, point it at your components, and its
  sub-plugins (e.g. llmInstructions) write their artifacts on build:

    import { typebook } from '@dennation/${PACKAGE_NAME}/vite'
    import { llmInstructions } from '@dennation/${PACKAGE_NAME}/plugins/llm-instructions'
    import path from 'node:path'
    // typebook is also exported from /rollup, /rolldown, /webpack, /rspack, /esbuild, /farm

    export default defineConfig({
      plugins: [
        typebook({
          components: 'src/components/**/*.tsx',
          plugins: [
            llmInstructions({
              entryPath: (c, { componentDir }) => path.join(componentDir, c.name + '.md'),
              indexPath: 'components.md',
            }),
          ],
        }),
      ],
    })
`);
