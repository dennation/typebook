import { getComponentMeta } from "@dennation/typebook/react";
import { Conditional } from "../components/WithConditionalTypes";

export const comp = getComponentMeta(Conditional, {
	defaultProps: {
		sizeLabel: "size-sm",
		color: 0 as any,
		extracted: "a",
		excluded: "a",
	},
	pick: ["sizeLabel", "color", "extracted", "excluded"],
});
