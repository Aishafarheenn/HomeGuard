import React from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FC] px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition"
            >
              Go to home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
