import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
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
        <div className="st:p-4 st:bg-red-500/10 st:border st:border-red-400/30 st:rounded-xl st:text-red-400 st:text-[13px] st:font-mono st:whitespace-pre-wrap st:backdrop-blur-sm">
          {this.state.error.message}
        </div>
      )
    }
    return this.props.children
  }
}
