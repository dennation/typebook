import { Component, type CSSProperties, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

const ERROR_STYLE: CSSProperties = {
  padding: 16,
  background: '#fff5f5',
  border: '1px solid #ffc9c9',
  borderRadius: 6,
  color: '#c92a2a',
  fontSize: 13,
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={ERROR_STYLE}>
          {this.state.error.message}
        </div>
      )
    }
    return this.props.children
  }
}
