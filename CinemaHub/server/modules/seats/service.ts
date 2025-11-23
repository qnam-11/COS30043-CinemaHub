/**
 * Seat State Management Service
 * 
 * This service manages the state of seats across all showtimes in memory.
 * It handles:
 * - Temporary seat locks (2-3 minute reservations)
 * - Automatic lock expiration
 * - Permanent bookings
 * - Conflict resolution
 * 
 * Data Structure:
 * seatLocks = {
 *   'showtime-123': {
 *     'A-1': { userId: 'user123', lockedAt: timestamp, timeout: timeoutId },
 *     'A-2': { userId: 'user456', lockedAt: timestamp, timeout: timeoutId }
 *   }
 * }
 */

interface SeatLock {
    userId: string
    lockedAt: number
    timeout: NodeJS.Timeout
}

interface ShowtimeSeats {
    [seat: string]: SeatLock
}

class SeatService {
    // In-memory storage for seat locks
    private seatLocks: Map<string, ShowtimeSeats> = new Map()

    // Lock duration in milliseconds (3 minutes)
    private readonly LOCK_DURATION = 3 * 60 * 1000

    /**
     * Get all locked seats for a showtime
     * Returns array of seat identifiers locked by any user
     */
    getLockedSeats(showtimeId: string): string[] {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (!showtimeSeats) return []

        return Object.keys(showtimeSeats)
    }

    /**
     * Get locked seats for a specific user
     */
    getUserLockedSeats(showtimeId: string, userId: string): string[] {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (!showtimeSeats) return []

        return Object.entries(showtimeSeats)
            .filter(([_, lock]) => lock.userId === userId)
            .map(([seat, _]) => seat)
    }

    /**
     * Lock a seat for a user (temporary reservation)
     * Returns success status and error message if failed
     */
    lockSeat(
        showtimeId: string,
        seat: string,
        userId: string,
        onExpire?: (seat: string) => void
    ): { success: boolean; error?: string } {
        // Initialize showtime if not exists
        if (!this.seatLocks.has(showtimeId)) {
            this.seatLocks.set(showtimeId, {})
        }

        const showtimeSeats = this.seatLocks.get(showtimeId)!

        // Check if seat is already locked
        if (showtimeSeats[seat]) {
            const existingLock = showtimeSeats[seat]

            // If locked by the same user, refresh the lock
            if (existingLock.userId === userId) {
                clearTimeout(existingLock.timeout)

                // Create new timeout
                const timeout = setTimeout(() => {
                    this.unlockSeat(showtimeId, seat, userId)
                    if (onExpire) onExpire(seat)
                }, this.LOCK_DURATION)

                showtimeSeats[seat] = {
                    userId,
                    lockedAt: Date.now(),
                    timeout
                }

                return { success: true }
            }

            // Locked by another user
            return {
                success: false,
                error: `Seat ${seat} is already locked by another user`
            }
        }

        // Lock the seat
        const timeout = setTimeout(() => {
            this.unlockSeat(showtimeId, seat, userId)
            if (onExpire) onExpire(seat)
        }, this.LOCK_DURATION)

        showtimeSeats[seat] = {
            userId,
            lockedAt: Date.now(),
            timeout
        }

        console.log(`Seat ${seat} locked for user ${userId} in showtime ${showtimeId}`)
        return { success: true }
    }

    /**
     * Unlock a seat
     * Only the user who locked it can unlock (or system on timeout)
     */
    unlockSeat(
        showtimeId: string,
        seat: string,
        userId: string
    ): { success: boolean; error?: string } {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (!showtimeSeats || !showtimeSeats[seat]) {
            return { success: false, error: 'Seat is not locked' }
        }

        const lock = showtimeSeats[seat]

        // Verify user owns the lock
        if (lock.userId !== userId) {
            return {
                success: false,
                error: 'You cannot unlock a seat locked by another user'
            }
        }

        // Clear timeout and remove lock
        clearTimeout(lock.timeout)
        delete showtimeSeats[seat]

        console.log(`Seat ${seat} unlocked by user ${userId} in showtime ${showtimeId}`)
        return { success: true }
    }

    /**
     * Unlock all seats for a user (when they disconnect)
     */
    unlockAllUserSeats(showtimeId: string, userId: string): string[] {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (!showtimeSeats) return []

        const unlockedSeats: string[] = []

        Object.entries(showtimeSeats).forEach(([seat, lock]) => {
            if (lock.userId === userId) {
                clearTimeout(lock.timeout)
                delete showtimeSeats[seat]
                unlockedSeats.push(seat)
            }
        })

        if (unlockedSeats.length > 0) {
            console.log(`Unlocked ${unlockedSeats.length} seats for user ${userId}`)
        }

        return unlockedSeats
    }

    /**
     * Check if a seat is locked
     */
    isSeatLocked(showtimeId: string, seat: string): boolean {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        return showtimeSeats ? !!showtimeSeats[seat] : false
    }

    /**
     * Check if a seat is locked by a specific user
     */
    isSeatLockedByUser(showtimeId: string, seat: string, userId: string): boolean {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (!showtimeSeats || !showtimeSeats[seat]) return false

        return showtimeSeats[seat].userId === userId
    }

    /**
     * Convert temporary locks to permanent bookings
     * Called after successful payment
     */
    confirmBooking(showtimeId: string, seats: string[], userId: string): { success: boolean } {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (!showtimeSeats) return { success: false }

        // Verify all seats are locked by this user
        for (const seat of seats) {
            if (!showtimeSeats[seat] || showtimeSeats[seat].userId !== userId) {
                return { success: false }
            }
        }

        // Clear timeouts (seats are now permanently booked)
        seats.forEach(seat => {
            if (showtimeSeats[seat]) {
                clearTimeout(showtimeSeats[seat].timeout)
                // Keep the lock but mark as permanent by removing timeout
                // In production, you'd save this to database
            }
        })

        console.log(`Booking confirmed for ${seats.length} seats by user ${userId}`)
        return { success: true }
    }

    /**
     * Get statistics for debugging
     */
    getStats() {
        const stats = {
            totalShowtimes: this.seatLocks.size,
            showtimes: [] as any[]
        }

        this.seatLocks.forEach((seats, showtimeId) => {
            stats.showtimes.push({
                showtimeId,
                lockedSeats: Object.keys(seats).length
            })
        })

        return stats
    }

    /**
     * Clear all locks for a showtime (admin/testing)
     */
    clearShowtime(showtimeId: string) {
        const showtimeSeats = this.seatLocks.get(showtimeId)
        if (showtimeSeats) {
            // Clear all timeouts
            Object.values(showtimeSeats).forEach(lock => {
                clearTimeout(lock.timeout)
            })
            this.seatLocks.delete(showtimeId)
            console.log(`Cleared all locks for showtime ${showtimeId}`)
        }
    }
}

// Singleton instance
export const seatService = new SeatService()
