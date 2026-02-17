import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { decodeJwtPayload, isTokenExpired } from '../utils/jwt'

const TOKEN_KEY = 'homeguard_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    const payload = decodeJwtPayload(token)
    if (!payload || isTokenExpired(payload)) {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      setLoading(false)
      return
    }
    setUser({
      id: payload.sub,
      role: payload.role || 'owner',
      username: payload.username || '',
      token,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const login = useCallback((token) => {
    const payload = decodeJwtPayload(token)
    if (!payload || isTokenExpired(payload)) return null
    localStorage.setItem(TOKEN_KEY, token)
    const userData = {
      id: payload.sub,
      role: payload.role || 'owner',
      username: payload.username || '',
      token,
    }
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    getToken,
    restoreSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
