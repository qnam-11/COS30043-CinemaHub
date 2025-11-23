/**
 * Socket.IO Event Handlers for Real-time Seat Management
 * 
 * This module handles WebSocket events for the seat booking system.
 * It manages room-based communication where each showtime is a separate room.
 * 
 * Key Events:
 * - join-showtime: User joins a showtime room
 * - leave-showtime: User leaves a showtime room
 * - lock-seat: User selects a seat (temporary reservation)
 * - unlock-seat: User deselects a seat
 * - confirm-booking: User completes checkout (permanent booking)
 * 
 * Broadcasting Pattern:
 * - socket.emit() - Send to sender only
 * - socket.to(room).emit() - Send to everyone in room except sender
 * - io.to(room).emit() - Send to everyone in room including sender
 */

import { Server as SocketIOServer, Socket } from 'socket.io'
import { seatService } from './service'

export function setupSeatSocket(io: SocketIOServer) {
    // Handle new client connections
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`)

        /**
         * Event: User joins a showtime room
         * Params: { showtimeId, userId }
         */
        socket.on('join-showtime', ({ showtimeId, userId }) => {
            console.log(`User ${userId} joining showtime ${showtimeId}`)

            // Join the Socket.IO room for this showtime
            socket.join(`showtime-${showtimeId}`)

            // Store user info in socket data for cleanup later
            socket.data.showtimeId = showtimeId
            socket.data.userId = userId

            // Send current locked seats to the newly joined user
            const lockedSeats = seatService.getLockedSeats(showtimeId)
            socket.emit('initial-locked-seats', lockedSeats)

            console.log(`User ${userId} joined showtime ${showtimeId}. Currently ${lockedSeats.length} seats locked.`)
        })

        /**
         * Event: User locks a seat
         * Params: { showtimeId, seat, userId }
         */
        socket.on('lock-seat', ({ showtimeId, seat, userId }) => {
            console.log(`Lock request: User ${userId} wants seat ${seat} in showtime ${showtimeId}`)

            // Attempt to lock the seat with auto-expire callback
            const result = seatService.lockSeat(
                showtimeId,
                seat,
                userId,
                (expiredSeat) => {
                    // Callback when lock expires (after 3 minutes)
                    console.log(`Lock expired for seat ${expiredSeat}`)

                    // Broadcast to all users in the room that seat is unlocked
                    io.to(`showtime-${showtimeId}`).emit('seat-unlocked', {
                        seat: expiredSeat
                    })
                }
            )

            if (result.success) {
                // Broadcast to ALL users in the room (including sender)
                // This ensures UI consistency across all clients
                io.to(`showtime-${showtimeId}`).emit('seat-locked', {
                    seat,
                    lockedBy: userId
                })

                // Send success confirmation to sender
                socket.emit('lock-success', { seat })
            } else {
                // Send error to sender only
                socket.emit('lock-failed', {
                    seat,
                    error: result.error
                })
            }
        })

        /**
         * Event: User unlocks a seat
         * Params: { showtimeId, seat, userId }
         */
        socket.on('unlock-seat', ({ showtimeId, seat, userId }) => {
            console.log(`Unlock request: User ${userId} unlocking seat ${seat}`)

            const result = seatService.unlockSeat(showtimeId, seat, userId)

            if (result.success) {
                // Broadcast to all users in the room
                io.to(`showtime-${showtimeId}`).emit('seat-unlocked', { seat })

                // Send confirmation to sender
                socket.emit('unlock-success', { seat })
            } else {
                socket.emit('unlock-failed', {
                    seat,
                    error: result.error
                })
            }
        })

        /**
         * Event: User confirms booking (after checkout)
         * Params: { showtimeId, seats, userId }
         */
        socket.on('confirm-booking', ({ showtimeId, seats, userId }) => {
            console.log(`Booking confirmation: User ${userId} booking ${seats.length} seats`)

            const result = seatService.confirmBooking(showtimeId, seats, userId)

            if (result.success) {
                // Broadcast each booked seat to all users
                seats.forEach((seat: string) => {
                    io.to(`showtime-${showtimeId}`).emit('seat-booked', { seat })
                })

                socket.emit('booking-confirmed', { seats })
            } else {
                socket.emit('booking-failed', {
                    error: 'Failed to confirm booking. Some seats may no longer be available.'
                })
            }
        })

        /**
         * Event: User explicitly leaves a showtime
         * Params: { showtimeId, userId }
         */
        socket.on('leave-showtime', ({ showtimeId, userId }) => {
            console.log(`User ${userId} leaving showtime ${showtimeId}`)

            // Unlock all seats held by this user
            const unlockedSeats = seatService.unlockAllUserSeats(showtimeId, userId)

            // Broadcast unlocked seats to remaining users
            unlockedSeats.forEach(seat => {
                io.to(`showtime-${showtimeId}`).emit('seat-unlocked', { seat })
            })

            // Leave the Socket.IO room
            socket.leave(`showtime-${showtimeId}`)
        })

        /**
         * Event: Client disconnects (browser closed, network issue, etc.)
         * Automatically unlocks all seats held by this user
         */
        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected: ${socket.id} (${reason})`)

            const { showtimeId, userId } = socket.data

            if (showtimeId && userId) {
                // Unlock all seats held by this user
                const unlockedSeats = seatService.unlockAllUserSeats(showtimeId, userId)

                // Broadcast unlocked seats to remaining users
                unlockedSeats.forEach(seat => {
                    io.to(`showtime-${showtimeId}`).emit('seat-unlocked', { seat })
                })

                console.log(`Cleaned up ${unlockedSeats.length} seats for disconnected user ${userId}`)
            }
        })

        /**
         * Event: Get seat statistics (for debugging/admin)
         */
        socket.on('get-stats', () => {
            const stats = seatService.getStats()
            socket.emit('stats', stats)
        })
    })

    console.log('Socket.IO seat management initialized')
}
