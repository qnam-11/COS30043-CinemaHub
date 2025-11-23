<template>
  <div class="movie-detail-page">
    <div class="container py-4">
      
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-white">Loading movie details...</p>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
        <router-link to="/movies" class="alert-link ms-2">Go back</router-link>
      </div>

      <div v-else-if="movie">
        
        <router-link to="/movies" class="btn btn-outline-secondary mb-4">
          ← Back to Movies
        </router-link>

        <div class="row mb-5">
          <div class="col-lg-4 col-md-5 mb-4">
            <img :src="movie.poster" :alt="movie.title" class="movie-poster-large" />
          </div>
          <div class="col-lg-8 col-md-7">
            <h1 class="movie-title-large">{{ movie.title }}</h1>
            <div class="movie-meta mb-3">
              <span class="badge bg-primary me-2">{{ movie.year }}</span>
              <span class="badge bg-secondary me-2">{{ movie.duration }}</span>
              <span class="badge bg-warning text-dark me-2">
                <span class="me-1">⭐</span>{{ movie.rating }}
              </span>
              <span 
                v-for="genre in movie.genre" 
                :key="genre" 
                class="badge bg-info me-2"
              >
                {{ genre }}
              </span>
            </div>

            <p class="movie-description">{{ movie.description }}</p>

            <div class="movie-details mb-4">
              <p><strong>Director:</strong> {{ movie.director }}</p>
              <p><strong>Cast:</strong> {{ movie.cast ? movie.cast.join(', ') : 'N/A' }}</p>
              <p><strong>Language:</strong> {{ movie.language ? movie.language.join(', ') : 'English' }}</p>
            </div>

            <div class="action-buttons mb-4">
              <button 
                v-if="isAuthenticated"
                @click="toggleLike" 
                class="btn btn-like me-2"
                :class="{ 'liked': isLiked }"
              >
                <span class="me-1">{{ isLiked ? '❤️' : '🤍' }}</span>
                {{ movie.likes }} Likes
              </button>
              <button 
                v-if="showtimes.length > 0"
                @click="scrollToShowtimes" 
                class="btn btn-primary"
              >
                🎟️ Book Tickets
              </button>
            </div>

            <div class="reviews-summary">
              <h5>User Reviews</h5>
              <div class="d-flex align-items-center mb-2">
                <div class="average-rating me-3">
                  <span class="rating-number">{{ averageRating || movie.rating }}</span>
                  <span class="rating-stars">{{ getStars(averageRating || movie.rating) }}</span>
                </div>
                <div class="review-count">
                  {{ movieReviews.length }} {{ movieReviews.length === 1 ? 'Review' : 'Reviews' }}
                </div>
              </div>
              <button 
                v-if="isAuthenticated && !userHasReviewed"
                @click="showReviewModal = true" 
                class="btn btn-sm btn-outline-primary"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>

        <div class="content-section mb-5" v-if="movie.synopsis">
          <h3>Synopsis</h3>
          <p class="synopsis-text">{{ movie.synopsis }}</p>
        </div>

        <div class="content-section mb-5" v-if="movie.trailer">
          <h3>Trailer</h3>
          <div class="trailer-container">
            <iframe 
              :src="movie.trailer" 
              title="Movie Trailer"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div class="content-section mb-5" v-if="showtimes.length > 0">
          <h3 id="showtimes-section">Showtimes & Tickets</h3>
          
          <div class="row g-3 mb-4">
            <div class="col-md-3">
              <label class="form-label">Cinema</label>
              <select v-model="filters.cinemaId" class="form-select" @change="filterShowtimes">
                <option value="">All Cinemas</option>
                <option v-for="cinema in cinemas" :key="cinema.id" :value="cinema.id">
                  {{ cinema.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Date</label>
              <select v-model="filters.date" class="form-select" @change="filterShowtimes">
                <option value="">All Dates</option>
                <option v-for="date in uniqueDates" :key="date" :value="date">
                  {{ formatDate(date) }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Format</label>
              <select v-model="filters.format" class="form-select" @change="filterShowtimes">
                <option value="">All Formats</option>
                <option v-for="format in uniqueFormats" :key="format" :value="format">
                  {{ format }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Language</label>
              <select v-model="filters.language" class="form-select" @change="filterShowtimes">
                <option value="">All Languages</option>
                <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">
                  {{ lang }}
                </option>
              </select>
            </div>
          </div>

          <div class="showtimes-list">
            <div 
              v-for="showtime in filteredShowtimes" 
              :key="showtime.id" 
              class="showtime-card"
            >
              <div class="showtime-info">
                <h5>{{ getCinemaName(showtime.cinemaId) }}</h5>
                <p class="text-muted mb-1">{{ showtime.address }}</p>
                <div class="showtime-details">
                  <span class="badge bg-secondary me-2">{{ formatDate(showtime.date) }}</span>
                  <span class="badge bg-primary me-2">{{ showtime.time }}</span>
                  <span class="badge bg-info me-2">{{ showtime.format }}</span>
                  <span class="badge bg-success me-2">{{ showtime.language }}</span>
                </div>
                <p class="mt-2 mb-0">
                  <strong>Screen {{ showtime.screenNumber }}</strong> • 
                  {{ showtime.availableSeats }} seats available
                </p>
              </div>
              <div class="showtime-booking">
                <div class="price-info mb-2">
                  <small class="text-muted">From</small>
                  <div class="price">${{ showtime.price.child.toFixed(2) }}</div>
                </div>
                <button 
                  @click="selectShowtime(showtime)" 
                  class="btn btn-primary"
                  :disabled="showtime.availableSeats === 0"
                >
                  {{ showtime.availableSeats === 0 ? 'Sold Out' : 'Select Seats' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="content-section mb-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>User Reviews ({{ movieReviews.length }})</h3>
            <select v-model="reviewSort" class="form-select w-auto" @change="sortReviews">
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>

          <div v-if="sortedReviews.length === 0" class="text-center text-muted py-4">
            No reviews yet. Be the first to review this movie!
          </div>

          <div v-else class="reviews-list">
            <div 
              v-for="review in sortedReviews" 
              :key="review.id" 
              class="review-card"
            >
              <div class="review-header">
                <div>
                  <strong>{{ review.userFullName }}</strong>
                  <div class="review-rating">
                    {{ getStars(review.rating) }}
                    <span class="rating-number-small">{{ review.rating }}/5</span>
                  </div>
                </div>
                <div class="review-date">
                  {{ formatReviewDate(review.date) }}
                </div>
              </div>
              <h5 class="review-title">{{ review.title }}</h5>
              <p class="review-content">{{ review.content }}</p>
              <div class="review-footer">
                <button 
                  @click="voteHelpful(review.id)" 
                  class="btn btn-sm btn-outline-secondary"
                  :class="{ 'active': hasVoted(review.id) }"
                  :disabled="!isAuthenticated"
                >
                  👍 Helpful ({{ review.helpful }})
                </button>
                <div v-if="canEditReview(review)">
                  <button 
                    @click="editReview(review)" 
                    class="btn btn-sm btn-outline-primary ms-2"
                  >
                    Edit
                  </button>
                  <button 
                    @click="deleteReview(review.id)" 
                    class="btn btn-sm btn-outline-danger ms-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> </div>

    <div v-if="showReviewModal" class="modal-overlay" @click.self="showReviewModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h4>{{ editingReview ? 'Edit Review' : 'Write a Review' }}</h4>
          <button @click="showReviewModal = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Rating *</label>
            <div class="star-rating-input">
              <span 
                v-for="star in 5" 
                :key="star"
                @click="reviewForm.rating = star"
                @mouseover="hoverRating = star"
                @mouseleave="hoverRating = 0"
                class="star"
                :class="{ 'filled': star <= (hoverRating || reviewForm.rating) }"
              >
                ⭐
              </span>
            </div>
            <small class="text-muted">{{ reviewForm.rating }}/5</small>
          </div>
          <div class="mb-3">
            <label class="form-label">Review Title *</label>
            <input 
              v-model="reviewForm.title" 
              type="text" 
              class="form-control"
              placeholder="Sum up your experience"
              maxlength="100"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Your Review *</label>
            <textarea 
              v-model="reviewForm.content" 
              class="form-control"
              rows="5"
              placeholder="Share your thoughts about this movie..."
              maxlength="1000"
            ></textarea>
            <small class="text-muted">{{ reviewForm.content.length }}/1000</small>
          </div>
          <div class="text-danger mb-3" v-if="reviewError">{{ reviewError }}</div>
        </div>
        <div class="modal-footer">
          <button @click="showReviewModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitReview" class="btn btn-primary">
            {{ editingReview ? 'Update' : 'Submit' }} Review
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moviesService from '../services/moviesService'
import authService from '../services/authService'
import cinemaService from '../services/cinemaService'
import reviewService from '../services/reviewService'

export default {
  name: 'MovieDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const movie = ref(null)
    const isLoading = ref(true)
    const errorMessage = ref('')
    const showtimes = ref([])
    const cinemas = ref([])
    const movieReviews = ref([])
    const isAuthenticated = ref(false)
    const isLiked = ref(false)
    const currentUser = ref(null)
    const filters = ref({
      cinemaId: '',
      date: '',
      format: '',
      language: ''
    })
    const filteredShowtimes = ref([])
    const showReviewModal = ref(false)
    const reviewSort = ref('recent')
    const reviewForm = ref({ rating: 5, title: '', content: '' })
    const reviewError = ref('')
    const editingReview = ref(null)
    const hoverRating = ref(0)

    const loadMovie = async () => {
      isLoading.value = true
      errorMessage.value = ''
      
      try {
        const movieId = parseInt(route.params.id)
        
        // 1. Force the service to load data first
        // Ensure movies-data.json is in /public
        await moviesService.loadMovies() 

        // 2. Get the specific movie
        const foundMovie = await moviesService.getMovieById(movieId)

        if (foundMovie) {
          movie.value = foundMovie
          
          if (isAuthenticated.value) {
            isLiked.value = moviesService.hasUserLiked(movieId)
          }
          movieReviews.value = reviewService.getMovieReviews(movieId)
        } else {
          errorMessage.value = 'Movie not found.'
        }
      } catch (error) {
        console.error('Failed to load movie:', error)
        errorMessage.value = 'Error loading data. Please try again.'
      } finally {
        isLoading.value = false 
      }
    }

    const loadShowtimes = async () => {
      try {
        await cinemaService.loadShowtimes()
        await cinemaService.loadCinemas()
        
        const movieId = parseInt(route.params.id)
        showtimes.value = cinemaService.getShowtimesByMovieId(movieId)
        cinemas.value = cinemaService.getAllCinemas()
        
        showtimes.value = showtimes.value.map(st => {
          const cinema = cinemas.value.find(c => c.id === st.cinemaId)
          return { ...st, address: cinema ? cinema.address : '' }
        })
        
        filteredShowtimes.value = showtimes.value
      } catch (e) {
        console.error("Error loading showtimes", e)
      }
    }

    const toggleLike = () => {
      const movieId = parseInt(route.params.id)
      const result = moviesService.toggleLike(movieId)
      movie.value.likes = result.likes
      isLiked.value = result.isLiked
    }

    const getCinemaName = (cinemaId) => {
      const cinema = cinemas.value.find(c => c.id === cinemaId)
      return cinema ? cinema.name : 'Unknown Cinema'
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const formatReviewDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      })
    }

    const filterShowtimes = () => {
      let filtered = [...showtimes.value]

      if (filters.value.cinemaId) {
        filtered = filtered.filter(st => st.cinemaId === parseInt(filters.value.cinemaId))
      }
      if (filters.value.date) {
        filtered = filtered.filter(st => st.date === filters.value.date)
      }
      if (filters.value.format) {
        filtered = filtered.filter(st => st.format === filters.value.format)
      }
      if (filters.value.language) {
        filtered = filtered.filter(st => st.language === filters.value.language)
      }

      filteredShowtimes.value = filtered
    }

    const selectShowtime = (showtime) => {
      if (!isAuthenticated.value) {
        router.push({ path: '/login', query: { redirect: route.fullPath } })
        return
      }
      
      router.push({ 
        name: 'SeatSelection', 
        params: { showtimeId: showtime.id },
        query: { movieId: movie.value.id }
      })
    }

    const scrollToShowtimes = () => {
      const element = document.getElementById('showtimes-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const getStars = (rating) => {
      if (!rating || rating < 0) return '☆☆☆☆☆'
      const safeRating = Math.min(Math.max(rating, 0), 5)
      const fullStars = Math.floor(safeRating)
      const halfStar = safeRating % 1 >= 0.5 ? 1 : 0
      const emptyStars = Math.max(0, 5 - fullStars - halfStar)
      return '⭐'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars)
    }

    const submitReview = async () => {
      if (!reviewForm.value.title.trim() || !reviewForm.value.content.trim()) {
        reviewError.value = 'Please fill in all fields'
        return
      }

      try {
        if (editingReview.value) {
          reviewService.updateReview(editingReview.value.id, {
            rating: reviewForm.value.rating,
            title: reviewForm.value.title,
            content: reviewForm.value.content
          })
        } else {
          reviewService.addReview(movie.value.id, {
            rating: reviewForm.value.rating,
            title: reviewForm.value.title,
            content: reviewForm.value.content
          })
        }
        
        movieReviews.value = reviewService.getMovieReviews(movie.value.id)
        showReviewModal.value = false
        reviewForm.value = { rating: 5, title: '', content: '' }
        editingReview.value = null
        reviewError.value = ''
      } catch (error) {
        reviewError.value = error.message
      }
    }

    const editReview = (review) => {
      editingReview.value = review
      reviewForm.value = {
        rating: review.rating,
        title: review.title,
        content: review.content
      }
      showReviewModal.value = true
    }

    const deleteReview = (reviewId) => {
      if (confirm('Are you sure you want to delete this review?')) {
        reviewService.deleteReview(reviewId)
        movieReviews.value = reviewService.getMovieReviews(movie.value.id)
      }
    }

    const voteHelpful = (reviewId) => {
      if (!isAuthenticated.value) return
      reviewService.voteHelpful(reviewId)
      movieReviews.value = reviewService.getMovieReviews(movie.value.id)
    }

    const canEditReview = (review) => {
      if (!currentUser.value) return false
      return review.username === currentUser.value.username || authService.isAdmin()
    }

    const hasVoted = (reviewId) => {
      return reviewService.hasUserVoted(reviewId)
    }

    const sortReviews = () => {
      // Trigger computed property update
    }

    const uniqueDates = computed(() => {
      const dates = new Set(showtimes.value.map(st => st.date))
      return Array.from(dates).sort()
    })

    const uniqueFormats = computed(() => {
      const formats = new Set(showtimes.value.map(st => st.format))
      return Array.from(formats)
    })

    const uniqueLanguages = computed(() => {
      const languages = new Set(showtimes.value.map(st => st.language))
      return Array.from(languages)
    })

    const averageRating = computed(() => {
      return reviewService.getAverageRating(movie.value?.id)
    })

    const userHasReviewed = computed(() => {
      if (!currentUser.value || !movie.value) return false
      return movieReviews.value.some(r => r.username === currentUser.value.username)
    })

    const sortedReviews = computed(() => {
      return reviewService.sortReviews(movieReviews.value, reviewSort.value)
    })

    onMounted(async () => {
      isAuthenticated.value = authService.isAuthenticated()
      currentUser.value = authService.getCurrentUser()
      
      // Use await to properly pause until data is ready
      await loadMovie()
      await loadShowtimes()
    })

    return {
      movie,
      isLoading,
      errorMessage,
      showtimes,
      cinemas,
      filteredShowtimes,
      filters,
      isAuthenticated,
      isLiked,
      movieReviews,
      showReviewModal,
      reviewForm,
      reviewError,
      reviewSort,
      editingReview,
      hoverRating,
      uniqueDates,
      uniqueFormats,
      uniqueLanguages,
      averageRating,
      userHasReviewed,
      sortedReviews,
      toggleLike,
      getCinemaName,
      formatDate,
      formatReviewDate,
      filterShowtimes,
      selectShowtime,
      scrollToShowtimes,
      getStars,
      submitReview,
      editReview,
      deleteReview,
      voteHelpful,
      canEditReview,
      hasVoted,
      sortReviews
    }
  }
}
</script>

<style scoped>
/* Keep your existing styles as they were */
.movie-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-background) 0%, var(--color-background-soft) 100%);
}

.form-label {
  color: var(--text-light);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  background-color: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: var(--text-light);
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  background-color: rgba(15, 23, 42, 0.8);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.25);
  color: var(--text-light);
  outline: none;
}

.form-select {
  cursor: pointer;
}

.form-select option {
  background-color: var(--dark-bg);
  color: var(--text-light);
  padding: 0.75rem;
  cursor: pointer;
}

.form-select option:hover,
.form-select option:checked {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.form-select option:focus {
  outline: none;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
  color: white !important;
}

.movie-poster-large {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.movie-title-large {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.movie-description {
  font-size: 1.1rem;
  line-height: 1.8;
  margin: 1.5rem 0;
  color: var(--color-text);
}

.movie-details p {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-like {
  background: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  transition: all 0.3s ease;
}

.btn-like:hover {
  transform: scale(1.05);
  border-color: #ef4444;
}

.btn-like.liked {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.reviews-summary {
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--vt-c-purple);
}

.rating-stars {
  font-size: 1.2rem;
}

.review-count {
  color: var(--color-text);
  font-size: 1.1rem;
}

.content-section {
  padding: 2rem 0;
}

.content-section h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.synopsis-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
}

.trailer-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.trailer-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.showtimes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.showtime-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.showtime-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.showtime-info h5 {
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.showtime-details {
  margin: 1rem 0;
}

.showtime-booking {
  text-align: center;
}

.price-info {
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--vt-c-green);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.review-rating {
  font-size: 1.2rem;
  margin-top: 0.25rem;
}

.rating-number-small {
  font-size: 0.9rem;
  color: var(--color-text);
  margin-left: 0.5rem;
}

.review-date {
  color: var(--color-text);
  font-size: 0.9rem;
}

.review-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-heading);
}

.review-content {
  line-height: 1.6;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-footer .btn.active {
  background: var(--vt-c-purple);
  color: white;
  border-color: var(--vt-c-purple);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--color-background);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h4 {
  margin: 0;
  color: var(--color-heading);
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.star-rating-input {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
  cursor: pointer;
}

.star-rating-input .star {
  filter: grayscale(100%);
  opacity: 0.5;
  transition: all 0.2s ease;
}

.star-rating-input .star.filled {
  filter: grayscale(0%);
  opacity: 1;
}

.star-rating-input .star:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .movie-title-large {
    font-size: 1.8rem;
  }

  .showtime-card {
    flex-direction: column;
    text-align: center;
  }

  .showtime-booking {
    width: 100%;
    margin-top: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>