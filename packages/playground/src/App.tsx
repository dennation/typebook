import { Button } from './components/Button'
import { ComposedButton } from './components/ComposedButton'
import { InlineButton } from './components/InlineButton'

export default function App() {
  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Studio Playground</h1>

      <section>
        <h2>Button</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="primary">Small</Button>
          <Button size="md" variant="secondary">Medium</Button>
          <Button size="lg" variant="ghost">Large</Button>
        </div>
      </section>

      <section>
        <h2>ComposedButton</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <ComposedButton size="sm" variant="primary">Composed SM</ComposedButton>
          <ComposedButton size="lg" variant="ghost" disabled>Disabled</ComposedButton>
        </div>
      </section>

      <section>
        <h2>InlineButton</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <InlineButton size="md" variant="secondary">Inline</InlineButton>
        </div>
      </section>
    </div>
  )
}
