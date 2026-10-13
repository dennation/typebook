import type { JSX } from "react";

/**
 * One step.
 * @remarks Declared in a declaration file.
 */
export declare function Step(props: { done?: boolean }): JSX.Element;

/** What `tsc` emits for `{ Step }`: no initializer, so `typeof` is the only link to the component. */
export declare const Steps: { Step: typeof Step };
