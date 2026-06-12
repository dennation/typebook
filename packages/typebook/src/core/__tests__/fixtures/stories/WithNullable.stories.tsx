import { registerComponent } from "@dennation/typebook";
import { Nullable } from "../components/WithNullable";

export const comp = registerComponent("with-nullable", Nullable, {
	defaultProps: { value: "test", data: 0, flag: false },
	pick: ["value", "status", "data", "flag"],
});
