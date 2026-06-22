import { Snippet } from "@dennation/typebook/react";
import { ButtonDemo, Counter } from "./demos";

const LocalDemo = () => <i>local</i>;

export function Page() {
	return (
		<>
			<Snippet source={ButtonDemo}>{(s) => s.preview}</Snippet>
			<Snippet source={Counter}>{(s) => s.preview}</Snippet>
			<Snippet source={LocalDemo}>{(s) => s.preview}</Snippet>
		</>
	);
}
