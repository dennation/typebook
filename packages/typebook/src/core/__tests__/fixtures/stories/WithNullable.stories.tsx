import { getComponentMeta } from "@dennation/typebook/react";
import { Nullable } from "../components/WithNullable";

export const comp = getComponentMeta(Nullable, {
	defaultProps: { value: "test", data: 0, flag: false },
	pick: ["value", "status", "data", "flag"],
});
