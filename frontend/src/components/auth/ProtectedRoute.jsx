import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const normalizedUserRole = String(user?.role || '').toLowerCase()
  const normalizedAllowedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => String(r).toLowerCase())
    : null

  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    // Keep authenticated users inside dashboard instead of bouncing to landing.
    return <Navigate to="/dashboard" replace />
  }

  return children
}
