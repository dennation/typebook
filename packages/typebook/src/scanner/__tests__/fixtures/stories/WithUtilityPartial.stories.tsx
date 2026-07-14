import { getComponentMeta } from "@dennation/typebook/react";
import { PartialComponent } from "../components/WithUtilityTypes";

export const comp = getComponentMeta(PartialComponent, {
	pick: ["a", "b", "c", "d"],
});
