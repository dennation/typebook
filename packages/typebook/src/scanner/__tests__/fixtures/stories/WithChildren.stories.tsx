import { defineStories } from "@dennation/typebook/react";
import { WithChildren } from "../components/WithChildren";

export const comp = defineStories(WithChildren, {
	defaultProps: { children: "Hello" },
});
