import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Sehatara] Render error caught by ErrorBoundary:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="error-boundary-fallback">
        <div className="error-boundary-card">
          <h2>Terjadi kesalahan pada aplikasi</h2>
          <p>
            Sehatara mengalami error yang tidak terduga. Coba muat ulang halaman atau reset aplikasi.
          </p>
          {this.state.error && (
            <pre className="error-boundary-detail">
              {this.state.error.message}
            </pre>
          )}
          <div className="error-boundary-actions">
            <button className="primary-button" onClick={this.handleReload} type="button">
              Muat Ulang
            </button>
            <button className="secondary-button" onClick={this.handleReset} type="button">
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
