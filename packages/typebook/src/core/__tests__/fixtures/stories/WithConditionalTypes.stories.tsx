import { registerComponent } from "@dennation/typebook";
import { Conditional } from "../components/WithConditionalTypes";

export const comp = registerComponent(Conditional, {
	defaultProps: {
		sizeLabel: "size-sm",
		color: 0 as any,
		extracted: "a",
		excluded: "a",
	},
	pick: ["sizeLabel", "color", "extracted", "excluded"],
});
