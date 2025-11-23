/**
 * Real-time Seat Management Composable
 * 
 * This composable handles WebSocket connections for real-time seat synchronization
 * across multiple users. It manages:
 * - Connection lifecycle (connect/disconnect)
 * - Seat locking when users select seats (temporary reservation)
 * - Real-time updates when other users lock/unlock seats
 * - Automatic cleanup and reconnection handling
 * 
 * Key Concepts for Tutorial:
 * 1. Socket.IO rooms - Each showtime has its own room for isolated communication
 * 2. Reactive state - Vue's ref/reactive for automatic UI updates
 * 3. Event-driven architecture - Emit and listen to seat events
 * 4. Cleanup with onUnmounted - Prevent memory leaks
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

export function useRealtimeSeats(showtimeId, userId) {
    // Reactive state - automatically triggers UI updates when changed
    const socket = ref(null)
    const lockedSeats = ref(new Set()) // Seats locked by OTHER users
    const isConnected = ref(false)
    const connectionError = ref(null)

    /**
     * Initialize WebSocket connection
     * Connect to the backend Socket.IO server and join the showtime-specific room
     */
    const connect = () => {
        try {
            // Connect to Socket.IO server (change URL for production)
            socket.value = io('http://localhost:3001', {
                transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            })

            // Event: Connection successful
            socket.value.on('connect', () => {
                console.log('Connected to real-time server')
                isConnected.value = true
                connectionError.value = null

                // Join the room for this specific showtime
                socket.value.emit('join-showtime', { showtimeId, userId })
            })

            // Event: Receive initial locked seats when joining
            socket.value.on('initial-locked-seats', (seats) => {
                console.log('Received initial locked seats:', seats)
                lockedSeats.value = new Set(seats)
            })

            // Event: Another user locked a seat
            socket.value.on('seat-locked', ({ seat, lockedBy }) => {
                // Only update if it's locked by someone else
                if (lockedBy !== userId) {
                    console.log(`Seat ${seat} locked by another user`)
                    lockedSeats.value.add(seat)
                }
            })

            // Event: A seat was unlocked (user deselected or timeout)
            socket.value.on('seat-unlocked', ({ seat }) => {
                console.log(`Seat ${seat} unlocked`)
                lockedSeats.value.delete(seat)
            })

            // Event: Seat permanently booked (checkout completed)
            socket.value.on('seat-booked', ({ seat }) => {
                console.log(`Seat ${seat} permanently booked`)
                // Keep it locked - it's now occupied
            })

            // Event: Connection error
            socket.value.on('connect_error', (error) => {
                console.error('Connection error:', error.message)
                isConnected.value = false
                connectionError.value = error.message
            })

            // Event: Disconnected from server
            socket.value.on('disconnect', (reason) => {
                console.log('Disconnected:', reason)
                isConnected.value = false
            })

        } catch (error) {
            console.error('Failed to initialize socket:', error)
            connectionError.value = error.message
        }
    }

    /**
     * Lock a seat (temporary reservation)
     * Call this when user selects a seat
     * 
     * @param {string} seat - Seat identifier (e.g., "A-1")
     * @returns {boolean} - Success status
     */
    const lockSeat = (seat) => {
        if (!socket.value || !isConnected.value) {
            console.warn('Cannot lock seat - not connected')
            return false
        }

        // Check if seat is already locked by another user
        if (lockedSeats.value.has(seat)) {
            console.warn(`Seat ${seat} is already locked by another user`)
            return false
        }

        // Emit lock event to server
        socket.value.emit('lock-seat', {
            showtimeId,
            seat,
            userId
        })

        return true
    }

    /**
     * Unlock a seat (cancel reservation)
     * Call this when user deselects a seat
     * 
     * @param {string} seat - Seat identifier (e.g., "A-1")
     */
    const unlockSeat = (seat) => {
        if (!socket.value || !isConnected.value) {
            console.warn('Cannot unlock seat - not connected')
            return
        }

        socket.value.emit('unlock-seat', {
            showtimeId,
            seat,
            userId
        })
    }

    /**
     * Unlock multiple seats at once
     * Useful when clearing all selections
     * 
     * @param {Array<string>} seats - Array of seat identifiers
     */
    const unlockSeats = (seats) => {
        seats.forEach(seat => unlockSeat(seat))
    }

    /**
     * Check if a seat is locked by another user
     * 
     * @param {string} seat - Seat identifier (e.g., "A-1")
     * @returns {boolean}
     */
    const isSeatLockedByOthers = (seat) => {
        return lockedSeats.value.has(seat)
    }

    /**
     * Confirm booking (convert temporary locks to permanent bookings)
     * Call this after successful payment/checkout
     * 
     * @param {Array<string>} seats - Array of seat identifiers
     */
    const confirmBooking = (seats) => {
        if (!socket.value || !isConnected.value) {
            console.warn('Cannot confirm booking - not connected')
            return
        }

        socket.value.emit('confirm-booking', {
            showtimeId,
            seats,
            userId
        })
    }

    /**
     * Disconnect from real-time server
     * Call this when component unmounts or user leaves page
     */
    const disconnect = () => {
        if (socket.value) {
            // Leave the showtime room
            socket.value.emit('leave-showtime', { showtimeId, userId })

            // Disconnect socket
            socket.value.disconnect()
            socket.value = null

            console.log('Disconnected from real-time server')
        }

        isConnected.value = false
        lockedSeats.value.clear()
    }

    // Lifecycle: Connect on mount
    onMounted(() => {
        connect()
    })

    // Lifecycle: Disconnect on unmount (cleanup)
    onUnmounted(() => {
        disconnect()
    })

    // Return public API
    return {
        // State
        isConnected,
        connectionError,
        lockedSeats,

        // Methods
        lockSeat,
        unlockSeat,
        unlockSeats,
        isSeatLockedByOthers,
        confirmBooking,
        connect,
        disconnect
    }
}
