import { useCallback, useEffect, useRef, useState } from "react";

/** How long the "copied" flash stays on, in ms. */
const COPIED_RESET_MS = 1500;

export interface UseCopy {
	/** True for a short moment after a successful copy. */
	copied: boolean;
	/** Write `text` to the clipboard and flash the copied state. */
	copy: (text: string) => void;
}

/**
 * Clipboard-copy micro-interaction: writes text and flips `copied` to true for
 * a moment. Shared by `CopyCommand` and `CodeBlock` so the clipboard call,
 * reset timeout and flash state live in one place.
 */
export function useCopy(resetMs: number = COPIED_RESET_MS): UseCopy {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
		},
		[],
	);

	const copy = useCallback(
		(text: string) => {
			navigator.clipboard?.writeText(text).catch(() => {});
			setCopied(true);
			if (timer.current) clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), resetMs);
		},
		[resetMs],
	);

	return { copied, copy };
}
