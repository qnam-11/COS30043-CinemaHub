import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readUsers, writeUsers, addRefreshToken, readRefreshTokens, removeRefreshToken } from '../../lib/db'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-example'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-example'

function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export const AuthService = {
  async register({ username, email, password, firstName, lastName }: any) {
    const users = await readUsers()
    const exists = users.find((u: any) => u.username === username || u.email === email)
    if (exists) throw new Error('User with same username or email already exists')

    const hashed = await bcrypt.hash(password, 8)
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
  },

  async login({ usernameOrEmail, password }: any) {
    const users = await readUsers()
    const user = users.find((u: any) => u.username === usernameOrEmail || u.email === usernameOrEmail)
    if (!user) throw new Error('Invalid username or password')
    if (!user.password) throw new Error('User does not have a password (try google login)')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid username or password')

    const payload = { id: user.id, username: user.username, role: user.role }
    const tokens = generateTokens(payload)
    await addRefreshToken(tokens.refreshToken)

    const { password: _pwd, ...userSafe } = user
    return { user: userSafe, ...tokens }
  },

  async googleAuthenticate({ email, googleId, firstName, lastName }: any) {
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
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new Error('refreshToken required')
    const tokens = await readRefreshTokens()
    if (!tokens.includes(refreshToken)) throw new Error('Refresh token not recognized')

    try {
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any
      const accessToken = jwt.sign({ id: payload.id, username: payload.username, role: payload.role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
      return { accessToken }
    } catch (err) {
      throw new Error('Invalid refresh token')
    }
  },

  async logout(refreshToken: string) {
    if (!refreshToken) throw new Error('refreshToken required')
    await removeRefreshToken(refreshToken)
    return { message: 'Logged out' }
  },

  async profile(accessToken: string) {
    if (!accessToken) throw new Error('Missing token')
    try {
      const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as any
      const users = await readUsers()
      const user = users.find((u: any) => u.id === payload.id)
      if (!user) throw new Error('User not found')
      const { password: _pwd, ...userSafe } = user
      return { user: userSafe }
    } catch (e) {
      throw new Error('Invalid token')
    }
  }
}
