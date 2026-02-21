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
        <div className="st:p-4 st:bg-red-50 st:border st:border-red-200 st:rounded-md st:text-red-700 st:text-[13px] st:font-mono st:whitespace-pre-wrap">
          {this.state.error.message}
        </div>
      )
    }
    return this.props.children
  }
}
