import type { StudioPluginConfig } from './types.js'

export interface StudioConfig {
  plugin?: StudioPluginConfig
}

export function defineConfig(config: StudioConfig): StudioConfig {
  return config
}
