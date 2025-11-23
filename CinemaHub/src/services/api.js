import authService from './authService'

// Lightweight fetch wrapper that attaches Bearer token and attempts a single
// automatic refresh when a 401 is returned.
export default async function apiFetch(url, opts = {}) {
  const headers = new Headers(opts.headers || {})

  const token = authService.getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json')

  const res = await fetch(url, { ...opts, headers })

  if (res.status !== 401) return res

  // On 401, try to refresh once
  try {
    const newToken = await authService.refreshAccessToken()
    if (!newToken) return res

    // retry original request with new token
    const headers2 = new Headers(opts.headers || {})
    headers2.set('Authorization', `Bearer ${newToken}`)
    headers2.set('Content-Type', headers2.get('Content-Type') || 'application/json')
    return await fetch(url, { ...opts, headers: headers2 })
  } catch (e) {
    // refresh failed, clear auth
    authService.clearAuth()
    return res
  }
}
