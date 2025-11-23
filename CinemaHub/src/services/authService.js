// Authentication service that talks to the backend (Elysia)
class AuthService {
        constructor() {
            // Elysia backend runs on port 3000 (app/index.ts)
            this.BASE_URL = 'http://localhost:3000'
            this.currentUser = this.loadUser()
        }

    loadUser() {
        const userStr = localStorage.getItem('currentUser')
        return userStr ? JSON.parse(userStr) : null
    }

    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
        this.currentUser = user
    }

    setTokens({ accessToken, refreshToken }) {
        if (accessToken) localStorage.setItem('accessToken', accessToken)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    }

    clearAuth() {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        this.currentUser = null
    }

    getAccessToken() {
        return localStorage.getItem('accessToken')
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken')
    }

    async register(userData) {
        const res = await fetch(`${this.BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Registration failed')

        this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
        this.saveUser(data.user)
        return data.user
    }

    async login(usernameOrEmail, password) {
        const res = await fetch(`${this.BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Login failed')

        this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
        this.saveUser(data.user)
        return data.user
    }

    // Google login: client collects google profile (or token) and sends to backend
    async googleLogin(googleProfile) {
        // googleProfile should include: { email, googleId, firstName, lastName }
        const res = await fetch(`${this.BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googleProfile)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Google login failed')

        this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
        this.saveUser(data.user)
        return data.user
    }

    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')
        const res = await fetch(`${this.BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        })
        const data = await res.json()
        if (!res.ok) {
            // clear auth on invalid refresh
            this.clearAuth()
            throw new Error(data.message || 'Could not refresh token')
        }
        localStorage.setItem('accessToken', data.accessToken)
        return data.accessToken
    }

    async logout() {
        const refreshToken = this.getRefreshToken()
        try {
            await fetch(`${this.BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            })
        } catch (e) {
            // ignore errors on logout
        }
        this.clearAuth()
    }

    isAuthenticated() {
        return !!this.currentUser
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin'
    }

    getCurrentUser() {
        return this.currentUser
    }
}

export default new AuthService()
