import { Elysia } from 'elysia'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { URLSearchParams } from 'url'
import { readUsers, writeUsers, readRefreshTokens, addRefreshToken, writeRefreshTokens, removeRefreshToken } from '../lib/db'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-example'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-example'

function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export default function registerAuth(app: any) {
  app
    .get('/auth/google/url', () => {
      const clientId = process.env.GOOGLE_CLIENT_ID
      const redirect = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
      const scope = encodeURIComponent('openid email profile')
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
      return { url }
    })

    .get('/auth/google/callback', async (ctx: any) => {
      const code = ctx.query.code as string
      if (!code) return ctx.response({ message: 'Missing code' }, 400)

      const clientId = process.env.GOOGLE_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET
      const redirect = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId || '',
          client_secret: clientSecret || '',
          redirect_uri: redirect,
          grant_type: 'authorization_code'
        })
      })

      if (!tokenRes.ok) {
        const text = await tokenRes.text()
        return ctx.response({ message: 'Token exchange failed', detail: text }, 500)
      }

      const tokenData = await tokenRes.json()
      const idToken = tokenData.id_token
      if (!idToken) return ctx.response({ message: 'No id_token returned' }, 500)

      const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
      if (!infoRes.ok) {
        const text = await infoRes.text()
        return ctx.response({ message: 'ID token verification failed', detail: text }, 500)
      }

      const profile = await infoRes.json()
      const email = profile.email
      const googleId = profile.sub
      const firstName = profile.given_name || ''
      const lastName = profile.family_name || ''

      const users = await readUsers()
      let user = users.find((u: any) => u.email === email)
      if (!user) {
        user = {
          id: Date.now(),
          username: email.split('@')[0],
          email,
          password: null,
          firstName,
          lastName,
          provider: 'google',
          googleId,
          role: 'user'
        }
        users.push(user)
        await writeUsers(users)
      }

      const payload = { id: user.id, username: user.username, role: user.role }
      const tokens = generateTokens(payload)
      await addRefreshToken(tokens.refreshToken)

  const { password, ...userSafe } = user
  return { user: userSafe, ...tokens }
    })

    .post('/auth/register', async (ctx: any) => {
      const { username, email, password: pwd, firstName, lastName } = ctx.body as any
      if (!username || !email || !pwd) return ctx.response({ message: 'username, email and password are required' }, 400)

      const users = await readUsers()
      const exists = users.find((u: any) => u.username === username || u.email === email)
      if (exists) return ctx.response({ message: 'User with same username or email already exists' }, 400)

  const hashed = await bcrypt.hash(pwd, 8)
      const newUser = {
        id: Date.now(),
        username,
        email,
        password: hashed,
        firstName: firstName || '',
        lastName: lastName || '',
        provider: 'local',
        role: 'user'
      }

      users.push(newUser)
      await writeUsers(users)

      const payload = { id: newUser.id, username: newUser.username, role: newUser.role }
      const tokens = generateTokens(payload)
      await addRefreshToken(tokens.refreshToken)

      const { password: _pwd, ...userSafe } = newUser
  return { user: userSafe, ...tokens }
    })

    .post('/auth/login', async (ctx: any) => {
      const { usernameOrEmail, password: pwd } = ctx.body as any
      if (!usernameOrEmail || !pwd) return ctx.response({ message: 'Missing credentials' }, 400)

      const users = await readUsers()
      const user = users.find((u: any) => u.username === usernameOrEmail || u.email === usernameOrEmail)
      if (!user) return ctx.response({ message: 'Invalid username or password' }, 401)

      if (!user.password) return ctx.response({ message: 'User does not have a password (try google login)' }, 400)

  const match = await bcrypt.compare(pwd, user.password)
      if (!match) return ctx.response({ message: 'Invalid username or password' }, 401)

      const payload = { id: user.id, username: user.username, role: user.role }
      const tokens = generateTokens(payload)
      await addRefreshToken(tokens.refreshToken)

      const { password: _pwd, ...userSafe } = user
  return { user: userSafe, ...tokens }
    })

    // client-side Google sign-in: receives profile from client (email, googleId, ...)
    .post('/auth/google', async (ctx: any) => {
      const { email, googleId, firstName, lastName } = ctx.body as any
      if (!email || !googleId) return ctx.response({ message: 'Missing google profile' }, 400)

      const users = await readUsers()
      let user = users.find((u: any) => u.email === email)
      if (!user) {
        user = {
          id: Date.now(),
          username: email.split('@')[0],
          email,
          password: null,
          firstName: firstName || '',
          lastName: lastName || '',
          provider: 'google',
          googleId,
          role: 'user'
        }
        users.push(user)
        await writeUsers(users)
      }

      const payload = { id: user.id, username: user.username, role: user.role }
      const tokens = generateTokens(payload)
      await addRefreshToken(tokens.refreshToken)

  const { password: _pwd, ...userSafe } = user
  return { user: userSafe, ...tokens }
    })

    .post('/auth/refresh', async (ctx: any) => {
      const { refreshToken } = ctx.body as any
      if (!refreshToken) return ctx.response({ message: 'refreshToken required' }, 400)

      const tokens = await readRefreshTokens()
      if (!tokens.includes(refreshToken)) return ctx.response({ message: 'Refresh token not recognized' }, 403)

      try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any
        const accessToken = jwt.sign({ id: payload.id, username: payload.username, role: payload.role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        return { accessToken }
      } catch (err) {
        return ctx.response({ message: 'Invalid refresh token' }, 403)
      }
    })

    .post('/auth/logout', async (ctx: any) => {
      const { refreshToken } = ctx.body as any
      if (!refreshToken) return ctx.response({ message: 'refreshToken required' }, 400)
      await removeRefreshToken(refreshToken)
      return { message: 'Logged out' }
    })

    .get('/profile', async (ctx: any) => {
      const auth = ctx.request.headers.get('authorization')
      if (!auth || !auth.startsWith('Bearer ')) return ctx.response({ message: 'Missing auth' }, 401)
      const token = auth.split(' ')[1]
      try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as any
        const users = await readUsers()
        const user = users.find((u: any) => u.id === payload.id)
        if (!user) return ctx.response({ message: 'User not found' }, 404)
  const { password, ...userSafe } = user
  return { user: userSafe }
      } catch (e) {
        return ctx.response({ message: 'Invalid token' }, 401)
      }
    })

  return app
}
