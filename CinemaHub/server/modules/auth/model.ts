import { t } from 'elysia'

export const AuthModel = {
  registerBody: t.Object({
    username: t.String(),
    email: t.String(),
    password: t.String(),
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String())
  }),

  loginBody: t.Object({
    usernameOrEmail: t.String(),
    password: t.String()
  }),

  googleBody: t.Object({
    email: t.String(),
    googleId: t.String(),
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String())
  }),

  refreshBody: t.Object({
    refreshToken: t.String()
  }),

  userResponse: t.Object({
    id: t.Number(),
    username: t.String(),
    email: t.String(),
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String()),
    provider: t.String(),
    role: t.String()
  })
}

export type RegisterBody = typeof AuthModel.registerBody.static
export type LoginBody = typeof AuthModel.loginBody.static
export type GoogleBody = typeof AuthModel.googleBody.static
