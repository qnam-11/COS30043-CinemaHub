import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import auth from './modules/auth'

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .get('/', () => ({ message: 'Hello Elysia (auth active)' }))

app.use(auth)

app.listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
