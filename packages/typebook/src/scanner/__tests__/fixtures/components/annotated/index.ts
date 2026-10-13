import type { FC } from "react";
import { Item } from "./Item";

type ItemComponent = FC<{ selected?: boolean; label: string }>;

interface ListParts {
	Item: typeof Item;
}

/** A `typeof` member names its component. */
export const ByTypeof: { Item: typeof Item } = { Item };

/** The same through a named contract. */
export const ByInterface: ListParts = { Item };

/** A bare signature names no component: the member is read from the initializer. */
export const BySignature: { Item: ItemComponent } = { Item };

/** An assertion hides the initializer the same way an annotation does. */
export const ByAssertion = { Item } as { Item: ItemComponent };
