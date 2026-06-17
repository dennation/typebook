import { getComponentMeta } from "@dennation/typebook/react";
import { Select } from "../components/WithGenerics";

export const select = getComponentMeta(Select<"alpha" | "beta" | "gamma">, {
	defaultProps: {
		value: "alpha",
		options: ["alpha", "beta", "gamma"],
		onChange: () => {},
	},
	pick: ["value", "options", "onChange", "placeholder"],
});
