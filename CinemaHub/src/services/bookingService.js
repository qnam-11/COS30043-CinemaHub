import authService from './authService'

class BookingService {
    constructor() {
        this.storageKey = 'bookings'
        this.cartKey = 'cart'
    }

    // Get all bookings from localStorage
    getBookings() {
        const bookings = localStorage.getItem(this.storageKey)
        return bookings ? JSON.parse(bookings) : []
    }

    // Save bookings to localStorage
    saveBookings(bookings) {
        localStorage.setItem(this.storageKey, JSON.stringify(bookings))
    }

    // Get user's bookings
    getUserBookings(username) {
        const allBookings = this.getBookings()
        return allBookings.filter(booking => booking.username === username)
    }

    // Get booking by ID
    getBookingById(id) {
        const bookings = this.getBookings()
        return bookings.find(booking => booking.id === id)
    }

    // Create new booking
    createBooking(bookingData) {
        const user = authService.getCurrentUser()
        if (!user) {
            throw new Error('User must be authenticated to create booking')
        }

        const bookings = this.getBookings()
        const newBooking = {
            id: Date.now(),
            username: user.username,
            movieId: bookingData.movieId,
            movieTitle: bookingData.movieTitle,
            showtimeId: bookingData.showtimeId,
            cinemaId: bookingData.cinemaId,
            cinemaName: bookingData.cinemaName,
            date: bookingData.date,
            time: bookingData.time,
            format: bookingData.format,
            language: bookingData.language,
            screenNumber: bookingData.screenNumber,
            seats: bookingData.seats, // Array of seat objects {row, number, type, price}
            totalPrice: bookingData.totalPrice,
            bookingDate: new Date().toISOString(),
            status: 'confirmed', // confirmed, cancelled
            bookingCode: this.generateBookingCode()
        }

        bookings.push(newBooking)
        this.saveBookings(bookings)
        return newBooking
    }

    // Update booking
    updateBooking(id, updates) {
        const bookings = this.getBookings()
        const index = bookings.findIndex(booking => booking.id === id)

        if (index === -1) {
            throw new Error('Booking not found')
        }

        // Check if user owns the booking
        const user = authService.getCurrentUser()
        if (bookings[index].username !== user.username && !authService.isAdmin()) {
            throw new Error('Not authorized to update this booking')
        }

        bookings[index] = { ...bookings[index], ...updates, updatedAt: new Date().toISOString() }
        this.saveBookings(bookings)
        return bookings[index]
    }

    // Cancel booking
    cancelBooking(id) {
        return this.updateBooking(id, { status: 'cancelled' })
    }

    // Delete booking (admin only)
    deleteBooking(id) {
        if (!authService.isAdmin()) {
            throw new Error('Only admins can delete bookings')
        }

        const bookings = this.getBookings()
        const filtered = bookings.filter(booking => booking.id !== id)
        this.saveBookings(filtered)
        return true
    }

    // Generate unique booking code
    generateBookingCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = 'CH-'
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    // Cart management
    getCart() {
        const cart = localStorage.getItem(this.cartKey)
        return cart ? JSON.parse(cart) : null
    }

    saveCart(cartData) {
        localStorage.setItem(this.cartKey, JSON.stringify(cartData))
    }

    clearCart() {
        localStorage.removeItem(this.cartKey)
    }

    addToCart(cartData) {
        this.saveCart(cartData)
    }

    // Get booking statistics for admin
    getBookingStats() {
        const bookings = this.getBookings()
        const totalBookings = bookings.length
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
        const totalRevenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.totalPrice, 0)

        return {
            totalBookings,
            confirmedBookings,
            cancelledBookings,
            totalRevenue
        }
    }

    // Get popular movies based on bookings
    getPopularMovies() {
        const bookings = this.getBookings().filter(b => b.status === 'confirmed')
        const movieCounts = {}

        bookings.forEach(booking => {
            if (!movieCounts[booking.movieId]) {
                movieCounts[booking.movieId] = {
                    movieId: booking.movieId,
                    movieTitle: booking.movieTitle,
                    count: 0
                }
            }
            movieCounts[booking.movieId].count++
        })

        return Object.values(movieCounts).sort((a, b) => b.count - a.count)
    }
}

export default new BookingService()
