import { getComponentMeta } from "@dennation/typebook/react";
import { OmittedComponent } from "../components/WithUtilityTypes";

export const comp = getComponentMeta(OmittedComponent, {
	defaultProps: { a: "hello" },
	pick: ["a", "b", "d"],
});
