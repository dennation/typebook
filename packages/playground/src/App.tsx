import { Studio } from '@dennation/ui-studio/react'
import registry from '../studio.registry.gen'

export default function App() {
  return (
		<Studio registry={registry} />
	)
}
