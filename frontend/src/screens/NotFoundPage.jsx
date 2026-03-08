import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FC] px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-[#7C3AED] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Page not found</h2>
        <p className="text-slate-600 mb-6">
          The page you are looking for does not exist or has been moved.
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

export default NotFoundPage
