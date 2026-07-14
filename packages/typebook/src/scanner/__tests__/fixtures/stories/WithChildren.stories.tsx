import { getComponentMeta } from "@dennation/typebook/react";
import { WithChildren } from "../components/WithChildren";

export const comp = getComponentMeta(WithChildren, {
	defaultProps: { children: "Hello" },
	pick: ["children", "icon", "onClick", "renderFooter"],
});
