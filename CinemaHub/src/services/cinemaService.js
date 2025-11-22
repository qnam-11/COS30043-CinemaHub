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
}

export default new CinemaService()
