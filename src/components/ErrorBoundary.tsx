import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[NihonGoPlus] Unhandled error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-hanko/10 flex items-center justify-center text-hanko">
            <AlertTriangle size={26} />
          </div>
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-ink-soft max-w-sm">
            {this.state.error.message || 'An unexpected error occurred. Try reloading the page.'}
          </p>
          <button className="btn-primary mt-2" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
