import { registerComponent } from "@dennation/typebook";
import { PartialComponent } from "../components/WithUtilityTypes";

export const comp = registerComponent(
	"with-utility-partial",
	PartialComponent,
	{
		pick: ["a", "b", "c", "d"],
	},
);
