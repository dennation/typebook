import { getComponentMeta } from "@dennation/typebook/react";
import { PickedComponent } from "../components/WithUtilityTypes";

export const comp = getComponentMeta(PickedComponent, {
	defaultProps: { a: "hello" },
	pick: ["a", "d"],
});
