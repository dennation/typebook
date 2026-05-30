import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Write `content` to `filePath` only if it differs from what's already on disk.
 * Prevents spurious watcher events when a regen produces identical output.
 */
export function writeIfChanged(filePath: string, content: string): void {
	const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : ''
	if (content !== existing) {
		mkdirSync(dirname(filePath), { recursive: true })
		writeFileSync(filePath, content, 'utf-8')
	}
}

/** Delete `filePath` if it exists. No-op when already absent. */
export function removeIfExists(filePath: string): void {
	if (existsSync(filePath)) {
		rmSync(filePath, { force: true })
	}
}
