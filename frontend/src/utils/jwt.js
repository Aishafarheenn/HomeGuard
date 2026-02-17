/**
 * Decode JWT payload without verification (server validates).
 * Used only for reading user id/role for UI and routing.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function isTokenExpired(payload) {
  if (!payload || !payload.exp) return true
  return payload.exp * 1000 < Date.now()
}
