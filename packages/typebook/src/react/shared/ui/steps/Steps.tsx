import { Step } from "./Step";
import { StepsRoot } from "./StepsRoot";

/**
 * Compound numbered procedure: `<Steps.Root>` wraps one or more `<Steps.Step>`
 * children. Counters and the connector line are pure CSS from the theme layer.
 *
 * ```tsx
 * <Steps.Root>
 *   <Steps.Step title="Install">…</Steps.Step>
 *   <Steps.Step title="Configure">…</Steps.Step>
 * </Steps.Root>
 * ```
 */
export const Steps = {
	Root: StepsRoot,
	Step,
};
