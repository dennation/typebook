import { defineStories } from "@dennation/typebook/react";
import { Conditional } from "../components/WithConditionalTypes";

export const comp = defineStories(Conditional, {
	defaultProps: {
		sizeLabel: "size-sm",
		color: 0 as any,
		extracted: "a",
		excluded: "a",
	},
});
