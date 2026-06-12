import { createContext, useContext } from "react";
import type { SnippetMap } from "@/types.js";

const SnippetContext = createContext<SnippetMap>({});

export const SnippetContextProvider = SnippetContext.Provider;

/** All registered snippets (`name → source`) from the surrounding provider. */
export function useSnippets(): SnippetMap {
	return useContext(SnippetContext);
}

/** Extracted source for a single snippet, or `undefined` when none is registered. */
export function useSnippet(name: string): string | undefined {
	return useSnippets()[name];
}
