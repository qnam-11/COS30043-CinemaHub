class CinemaService {
    constructor() {
        this.cinemas = []
        this.showtimes = []
    }

    async loadCinemas() {
        try {
            const response = await fetch('/cinemas-data.json')
            this.cinemas = await response.json()
            return this.cinemas
        } catch (error) {
            console.error('Error loading cinemas:', error)
            return []
        }
    }

    async loadShowtimes() {
        try {
            const response = await fetch('/showtimes-data.json')
            this.showtimes = await response.json()
            return this.showtimes
        } catch (error) {
            console.error('Error loading showtimes:', error)
            return []
        }
    }

    getAllCinemas() {
        return this.cinemas
    }

    getCinemaById(id) {
        return this.cinemas.find(cinema => cinema.id === id)
    }

    getShowtimesByMovieId(movieId) {
        return this.showtimes.filter(showtime => showtime.movieId === movieId)
    }

    getShowtimeById(id) {
        return this.showtimes.find(showtime => showtime.id === id)
    }

    getShowtimesByCinemaId(cinemaId) {
        return this.showtimes.filter(showtime => showtime.cinemaId === cinemaId)
    }

    getShowtimesByDate(date) {
        return this.showtimes.filter(showtime => showtime.date === date)
    }

    getShowtimesByFilters(filters = {}) {
        let filtered = [...this.showtimes]

        if (filters.movieId) {
            filtered = filtered.filter(st => st.movieId === filters.movieId)
        }

        if (filters.cinemaId) {
            filtered = filtered.filter(st => st.cinemaId === filters.cinemaId)
        }

        if (filters.date) {
            filtered = filtered.filter(st => st.date === filters.date)
        }

        if (filters.language) {
            filtered = filtered.filter(st => st.language === filters.language)
        }

        if (filters.format) {
            filtered = filtered.filter(st => st.format === filters.format)
        }

        if (filters.minPrice) {
            filtered = filtered.filter(st => st.price.adult >= parseFloat(filters.minPrice))
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(st => st.price.adult <= parseFloat(filters.maxPrice))
        }

        return filtered
    }

    getUniqueLanguages() {
        const languages = new Set()
        this.showtimes.forEach(st => languages.add(st.language))
        return Array.from(languages).sort()
    }

    getUniqueFormats() {
        const formats = new Set()
        this.showtimes.forEach(st => formats.add(st.format))
        return Array.from(formats).sort()
    }

    getUniqueDates() {
        const dates = new Set()
        this.showtimes.forEach(st => dates.add(st.date))
        return Array.from(dates).sort()
    }

    updateShowtimeSeats(showtimeId, seatsBooked) {
        const showtime = this.getShowtimeById(showtimeId)
        if (showtime) {
            showtime.availableSeats -= seatsBooked
            // In a real app, this would sync with backend
            return true
        }
        return false
    }

    // Get occupied seats for a showtime (persisted in localStorage)
    getOccupiedSeats(showtimeId) {
        try {
            const key = `showtime_seats_${showtimeId}`
            const stored = localStorage.getItem(key)
            if (stored) {
                return JSON.parse(stored)
            }

            // Generate initial occupied seats based on availableSeats
            const showtime = this.getShowtimeById(showtimeId)
            if (!showtime) return []

            const totalSeats = 120 // 10 rows × 12 seats
            const occupiedCount = totalSeats - showtime.availableSeats
            const occupiedSeats = this.generateConsistentOccupiedSeats(showtimeId, occupiedCount)

            // Store for consistency
            localStorage.setItem(key, JSON.stringify(occupiedSeats))
            return occupiedSeats
        } catch (error) {
            console.error('Error getting occupied seats:', error)
            return []
        }
    }

    // Generate consistent occupied seats based on showtimeId (deterministic)
    generateConsistentOccupiedSeats(showtimeId, count) {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        const seatsPerRow = 12
        const occupiedSeats = []

        // Use showtimeId as seed for consistent randomness
        let seed = showtimeId * 12345
        const seededRandom = () => {
            seed = (seed * 9301 + 49297) % 233280
            return seed / 233280
        }

        const allSeats = []
        rows.forEach(row => {
            for (let i = 1; i <= seatsPerRow; i++) {
                allSeats.push(`${row}-${i}`)
            }
        })

        // Fisher-Yates shuffle with seeded random
        for (let i = allSeats.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1))
                ;[allSeats[i], allSeats[j]] = [allSeats[j], allSeats[i]]
        }

        // Take first 'count' seats as occupied
        return allSeats.slice(0, count)
    }

    // Mark seats as occupied when booking is confirmed
    markSeatsAsOccupied(showtimeId, seats) {
        try {
            const key = `showtime_seats_${showtimeId}`
            const currentOccupied = this.getOccupiedSeats(showtimeId)

            // Add new seats to occupied list
            seats.forEach(seat => {
                const seatId = `${seat.row}-${seat.number}`
                if (!currentOccupied.includes(seatId)) {
                    currentOccupied.push(seatId)
                }
            })

            localStorage.setItem(key, JSON.stringify(currentOccupied))

            // Update available seats count
            this.updateShowtimeSeats(showtimeId, seats.length)

            return true
        } catch (error) {
            console.error('Error marking seats as occupied:', error)
            return false
        }
    }
}

export default new CinemaService()
