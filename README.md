<div align="center">

# Typebook

**Documentation that writes itself — a React component documentation toolkit.**

[Website](https://dennation.github.io/typebook/) · [Package docs](packages/typebook/README.md)

</div>

---

> [!WARNING]
> **This is an experimental playground, not a product.**
>
> This repository is where ideas get vibe-coded into existence: APIs appear, mutate, and vanish between commits; whole packages get rewritten on a whim; history is occasionally rewritten too. Nothing here has been hardened, audited, or blessed for serious use.
>
> **Do not use this in production.** Feel free to explore, borrow ideas, or watch the experiment unfold — just don't build anything load-bearing on top of it yet.

## What's inside

A pnpm workspace monorepo:

| Path | Package | What it is |
|------|---------|------------|
| `packages/typebook` | `@dennation/typebook` | Component documentation library + bundler plugin. Scans `register()` calls, extracts prop types via the TypeScript Compiler API, renders stories, variant grids, matrices, and playgrounds. |
| `examples/tanstack-router` | — | Minimal example: TanStack Router + typebook. |
| `examples/tanstack-router-mdx` | — | Same, with MDX pages. |
| `apps/website` | — | The [marketing landing site](https://dennation.github.io/typebook/), deployed to GitHub Pages. |

## Development

```bash
pnpm install         # Install all workspace dependencies
pnpm run build       # Build all packages
pnpm run dev         # Dev mode for all packages in parallel
pnpm run typecheck   # Type-check all packages
```

## License

MIT
