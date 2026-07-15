import { defineStories } from "@dennation/typebook/react";
import { Nullable } from "../components/WithNullable";

export const comp = defineStories(Nullable, {
	defaultProps: { value: "test", data: 0, flag: false },
});
