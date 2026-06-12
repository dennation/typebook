import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	render() {
		if (this.state.error) {
			if (this.props.fallback) return this.props.fallback;
			return (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] font-mono whitespace-pre-wrap">
					{this.state.error.message}
				</div>
			);
		}
		return this.props.children;
	}
}
