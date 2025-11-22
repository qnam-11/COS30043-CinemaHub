import authService from './authService'

class ReviewService {
    constructor() {
        this.storageKey = 'reviews'
    }

    // Get all reviews from localStorage
    getReviews() {
        const reviews = localStorage.getItem(this.storageKey)
        return reviews ? JSON.parse(reviews) : []
    }

    // Save reviews to localStorage
    saveReviews(reviews) {
        localStorage.setItem(this.storageKey, JSON.stringify(reviews))
    }

    // Get reviews for a specific movie
    getMovieReviews(movieId) {
        const allReviews = this.getReviews()
        return allReviews.filter(review => review.movieId === movieId)
    }

    // Get review by ID
    getReviewById(id) {
        const reviews = this.getReviews()
        return reviews.find(review => review.id === id)
    }

    // Add new review
    addReview(movieId, reviewData) {
        const user = authService.getCurrentUser()
        if (!user) {
            throw new Error('User must be authenticated to add review')
        }

        // Check if user already reviewed this movie
        const existingReviews = this.getMovieReviews(movieId)
        const userReview = existingReviews.find(r => r.username === user.username)

        if (userReview) {
            throw new Error('You have already reviewed this movie')
        }

        const reviews = this.getReviews()
        const newReview = {
            id: Date.now(),
            movieId,
            username: user.username,
            userFullName: `${user.firstName} ${user.lastName}`,
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
            date: new Date().toISOString(),
            helpful: 0, // Number of users who found this helpful
            helpfulBy: [] // Array of usernames who voted helpful
        }

        reviews.push(newReview)
        this.saveReviews(reviews)
        return newReview
    }

    // Update review
    updateReview(id, updates) {
        const reviews = this.getReviews()
        const index = reviews.findIndex(review => review.id === id)

        if (index === -1) {
            throw new Error('Review not found')
        }

        // Check if user owns the review
        const user = authService.getCurrentUser()
        if (reviews[index].username !== user.username && !authService.isAdmin()) {
            throw new Error('Not authorized to update this review')
        }

        reviews[index] = {
            ...reviews[index],
            ...updates,
            updatedAt: new Date().toISOString()
        }
        this.saveReviews(reviews)
        return reviews[index]
    }

    // Delete review
    deleteReview(id) {
        const reviews = this.getReviews()
        const review = reviews.find(r => r.id === id)

        if (!review) {
            throw new Error('Review not found')
        }

        const user = authService.getCurrentUser()
        if (review.username !== user.username && !authService.isAdmin()) {
            throw new Error('Not authorized to delete this review')
        }

        const filtered = reviews.filter(review => review.id !== id)
        this.saveReviews(filtered)
        return true
    }

    // Vote review as helpful
    voteHelpful(id) {
        const user = authService.getCurrentUser()
        if (!user) {
            throw new Error('User must be authenticated to vote')
        }

        const reviews = this.getReviews()
        const index = reviews.findIndex(review => review.id === id)

        if (index === -1) {
            throw new Error('Review not found')
        }

        const review = reviews[index]

        // Check if user already voted
        if (review.helpfulBy.includes(user.username)) {
            // Remove vote
            review.helpful -= 1
            review.helpfulBy = review.helpfulBy.filter(u => u !== user.username)
        } else {
            // Add vote
            review.helpful += 1
            review.helpfulBy.push(user.username)
        }

        this.saveReviews(reviews)
        return reviews[index]
    }

    // Check if user has voted for a review
    hasUserVoted(reviewId) {
        const user = authService.getCurrentUser()
        if (!user) return false

        const review = this.getReviewById(reviewId)
        return review ? review.helpfulBy.includes(user.username) : false
    }

    // Get average rating for a movie
    getAverageRating(movieId) {
        const reviews = this.getMovieReviews(movieId)
        if (reviews.length === 0) return 0

        const sum = reviews.reduce((total, review) => total + review.rating, 0)
        return (sum / reviews.length).toFixed(1)
    }

    // Get rating distribution for a movie
    getRatingDistribution(movieId) {
        const reviews = this.getMovieReviews(movieId)
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

        reviews.forEach(review => {
            distribution[review.rating]++
        })

        return distribution
    }

    // Sort reviews
    sortReviews(reviews, sortBy = 'recent') {
        const sorted = [...reviews]

        switch (sortBy) {
            case 'recent':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
            case 'helpful':
                return sorted.sort((a, b) => b.helpful - a.helpful)
            case 'rating-high':
                return sorted.sort((a, b) => b.rating - a.rating)
            case 'rating-low':
                return sorted.sort((a, b) => a.rating - b.rating)
            default:
                return sorted
        }
    }
}

export default new ReviewService()
