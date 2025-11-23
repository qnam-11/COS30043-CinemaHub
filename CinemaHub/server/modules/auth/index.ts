import { Elysia } from 'elysia'
import { AuthService } from './service'
import { AuthModel } from './model'

export const auth = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body }) => {
    const res = await AuthService.register(body)
    return res
  }, { body: AuthModel.registerBody })

  .post('/login', async ({ body }) => {
    const res = await AuthService.login(body)
    return res
  }, { body: AuthModel.loginBody })

  // client-side Google sign-in: receives profile from client (email, googleId, ...)
  .post('/google', async ({ body }) => {
    const res = await AuthService.googleAuthenticate(body)
    return res
  }, { body: AuthModel.googleBody })

  .post('/refresh', async ({ body }) => {
    const { refreshToken } = body as any
    const res = await AuthService.refresh(refreshToken)
    return res
  }, { body: AuthModel.refreshBody })

  .post('/logout', async ({ body }) => {
    const { refreshToken } = body as any
    const res = await AuthService.logout(refreshToken)
    return res
  }, { body: AuthModel.refreshBody })

  .get('/profile', async (ctx: any) => {
    const auth = ctx.request.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) return ctx.response({ message: 'Missing auth' }, 401)
    const token = auth.split(' ')[1]
    try {
      const res = await AuthService.profile(token)
      return res
    } catch (e: any) {
      return ctx.response({ message: e.message || 'Invalid token' }, 401)
    }
  })

export default auth
