import { defineStories } from "@dennation/typebook/react";
import { ComplexUnion } from "../components/WithComplexUnions";

export const comp = defineStories(ComplexUnion, {
	defaultProps: {
		mixed: "hello",
		numLiteral: 1,
		singleLiteral: "only",
		boolOrString: true,
		wide: "a",
	},
});
