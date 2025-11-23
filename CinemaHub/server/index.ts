import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { Server as SocketIOServer } from 'socket.io'
import auth from './modules/auth'
import { setupSeatSocket } from './modules/seats/socket'

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .get('/', () => ({ message: 'Hello Elysia (auth active) with Real-time Seat Booking' }))

app.use(auth)

app.listen(3000)

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Initialize Socket.IO for real-time seat management on the same port
// Note: Socket.IO with Bun - using the underlying server
const io = new SocketIOServer({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
})

// Attach Socket.IO to the same port by listening on it
io.listen(3001) // Using port 3001 for Socket.IO to avoid conflicts with Elysia

// Setup seat management socket handlers
setupSeatSocket(io)

console.log('Socket.IO real-time seat booking enabled on port 3001')
