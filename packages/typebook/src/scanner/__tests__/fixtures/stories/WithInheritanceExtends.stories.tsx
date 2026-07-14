import { getComponentMeta } from "@dennation/typebook/react";
import { ExtendedButton } from "../components/WithInheritance";

export const comp = getComponentMeta(ExtendedButton, {
	defaultProps: { id: "btn-1" },
	pick: ["id", "className", "variant", "disabled"],
});
