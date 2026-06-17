import { registerComponent } from "@dennation/typebook";
import { OmittedComponent } from "../components/WithUtilityTypes";

export const comp = registerComponent(OmittedComponent, {
	defaultProps: { a: "hello" },
	pick: ["a", "b", "d"],
});
