import { getComponentMeta } from "@dennation/typebook/react";
import { DemoButton } from "./DemoButton";

/**
 * The handle every live landing demo renders from. Authored with an empty
 * `props` — the `typebook()` plugin (wired in vite.config.ts) reads DemoButton's
 * prop types through the TypeScript compiler and injects them as `__props` here
 * at build time, so `<Variants>` / `<Matrix>` / `<Playground>` have real axes.
 */
export const demoButton = getComponentMeta(DemoButton, {
	defaultProps: { children: "Button", tone: "accent" },
});
