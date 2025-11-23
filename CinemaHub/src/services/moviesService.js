// Movies service for managing movie data
class MoviesService {
    constructor() {
        this.movies = []
        this.loadingPromise = null
    }

    // Load movies from JSON and localStorage
    async loadMovies() {
        // Prevent multiple simultaneous loads
        if (this.loadingPromise) {
            return this.loadingPromise
        }

        // If already loaded, return immediately
        if (this.movies.length > 0) {
            return this.movies
        }

        this.loadingPromise = (async () => {
            try {
                console.log('Fetching movies from /movies-data.json...')
                const response = await fetch('/movies-data.json')

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const jsonMovies = await response.json()
                console.log('Movies loaded:', jsonMovies.length)

                // Check localStorage for additional movies
                const storedMovies = localStorage.getItem('movies')
                const localMovies = storedMovies ? JSON.parse(storedMovies) : []

                // Combine and deduplicate
                const allMovies = [...jsonMovies, ...localMovies]
                this.movies = allMovies.filter((movie, index, self) =>
                    index === self.findIndex(m => m.id === movie.id)
                )

                return this.movies
            } catch (error) {
                console.error('Error loading movies:', error)
                return []
            } finally {
                this.loadingPromise = null
            }
        })()

        return this.loadingPromise
    }

    // Save movies to localStorage
    saveMovies() {
        const customMovies = this.movies.filter(movie => movie.id > 1000)
        localStorage.setItem('movies', JSON.stringify(customMovies))
    }

    // Get all movies
    async getAllMovies() {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }
        return this.movies
    }

    // Get movie by ID
    async getMovieById(id) {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }
        return this.movies.find(movie => movie.id === parseInt(id))
    }

    // Add new movie
    async addMovie(movieData, username) {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }

        const newMovie = {
            id: Math.max(...this.movies.map(m => m.id), 1000) + 1,
            ...movieData,
            likes: 0,
            addedBy: username
        }

        this.movies.push(newMovie)
        this.saveMovies()
        return newMovie
    }

    // Update movie
    async updateMovie(id, movieData) {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }

        const index = this.movies.findIndex(movie => movie.id === parseInt(id))
        if (index === -1) {
            throw new Error('Movie not found')
        }

        this.movies[index] = {
            ...this.movies[index],
            ...movieData
        }

        this.saveMovies()
        return this.movies[index]
    }

    // Delete movie
    async deleteMovie(id) {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }

        const index = this.movies.findIndex(movie => movie.id === parseInt(id))
        if (index === -1) {
            throw new Error('Movie not found')
        }

        this.movies.splice(index, 1)
        this.saveMovies()
    }

    // Toggle like on movie
    async toggleLike(id) {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }

        const movie = this.movies.find(m => m.id === parseInt(id))
        if (!movie) {
            throw new Error('Movie not found')
        }

        // Check if user already liked this movie
        const likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]')
        const userLikedIndex = likedMovies.indexOf(id)

        if (userLikedIndex > -1) {
            // Unlike
            movie.likes = Math.max(0, movie.likes - 1)
            likedMovies.splice(userLikedIndex, 1)
        } else {
            // Like
            movie.likes++
            likedMovies.push(id)
        }

        localStorage.setItem('likedMovies', JSON.stringify(likedMovies))
        this.saveMovies()
        return movie
    }

    // Check if user liked a movie
    hasUserLiked(id) {
        const likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]')
        return likedMovies.includes(id)
    }

    // Search movies
    async searchMovies(query, filters = {}) {
        if (this.movies.length === 0) {
            await this.loadMovies()
        }

        let results = [...this.movies]

        // Filter by search query
        if (query) {
            const lowerQuery = query.toLowerCase()
            results = results.filter(movie =>
                movie.title.toLowerCase().includes(lowerQuery) ||
                movie.description.toLowerCase().includes(lowerQuery) ||
                movie.director.toLowerCase().includes(lowerQuery)
            )
        }

        // Filter by genre
        if (filters.genre) {
            results = results.filter(movie =>
                movie.genre.some(g => g.toLowerCase() === filters.genre.toLowerCase())
            )
        }

        // Filter by year
        if (filters.year) {
            results = results.filter(movie => movie.year === parseInt(filters.year))
        }

        // Filter by minimum rating
        if (filters.minRating) {
            results = results.filter(movie => movie.rating >= parseFloat(filters.minRating))
        }

        // Sort results
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'rating':
                    results.sort((a, b) => b.rating - a.rating)
                    break
                case 'year':
                    results.sort((a, b) => b.year - a.year)
                    break
                case 'likes':
                    results.sort((a, b) => b.likes - a.likes)
                    break
                case 'title':
                    results.sort((a, b) => a.title.localeCompare(b.title))
                    break
            }
        }

        return results
    }
}

export default new MoviesService()
