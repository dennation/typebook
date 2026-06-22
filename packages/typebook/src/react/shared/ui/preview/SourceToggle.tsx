import type { ReactNode } from "react";
import { Disclosure } from "./Disclosure";

export interface SourceToggleProps {
	/** The revealed source. `null` shows the "no source" fallback. */
	source: ReactNode | null;
}

/** The "show source" disclosure: a `<Disclosure label="source">` with the no-source fallback. */
export function SourceToggle({ source }: SourceToggleProps) {
	return (
		<Disclosure label="source">
			{source ?? (
				<p className="text-xs text-fg-muted p-3 m-0">
					No source found for this snippet. Add the typebook bundler plugin and
					rebuild.
				</p>
			)}
		</Disclosure>
	);
}
