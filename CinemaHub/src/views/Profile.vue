<template>
  <div class="profile-page" v-if="user">
    <div class="container py-5">
      <!-- Profile Header -->
      <div class="profile-header mb-5">
        <div class="profile-avatar">
          {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
        </div>
        <div class="profile-info">
          <h2>{{ user.firstName }} {{ user.lastName }}</h2>
          <!-- <p class="text-muted">@{{ user.username }}</p> -->
          <p class="text-muted">{{ user.email }}</p>
          <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'">
            {{ user.role === 'admin' ? 'Admin' : 'Member' }}
          </span>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid mb-5">
        <div class="stat-card">
          <div class="stat-icon"><span class="mdi mdi-ticket"></span></div>
          <div class="stat-value">{{ confirmedBookings.length }}</div>
          <div class="stat-label">Total Bookings</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><span class="mdi mdi-heart"></span></div>
          <div class="stat-value">{{ likedMoviesCount }}</div>
          <div class="stat-label">Liked Movies</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><span class="mdi mdi-star"></span></div>
          <div class="stat-value">{{ userReviewsCount }}</div>
          <div class="stat-label">Reviews Written</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><span class="mdi mdi-cash"></span></div>
          <div class="stat-value">${{ totalSpent.toFixed(0) }}</div>
          <div class="stat-label">Total Spent</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs mb-4">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ 'active': activeTab === tab.id }"
        >
          <span class="mdi" :class="tab.icon"></span> {{ tab.label }}
        </button>
      </div>

      <!-- Booking History Tab -->
      <div v-if="activeTab === 'bookings'" class="tab-content">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3>My Bookings</h3>
          <select v-model="bookingFilter" class="form-select w-auto">
            <option value="all">All Bookings</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div v-if="filteredBookings.length === 0" class="empty-state">
          <div class="empty-icon"><span class="mdi mdi-movie-open"></span></div>
          <h4>No bookings found</h4>
          <p>Start booking tickets to watch amazing movies!</p>
          <router-link to="/movies" class="btn btn-primary">Browse Movies</router-link>
        </div>

        <div v-else class="bookings-list">
          <div 
            v-for="booking in filteredBookings" 
            :key="booking.id"
            class="booking-card"
            :class="{ 'cancelled': booking.status === 'cancelled' }"
          >
            <div class="booking-header">
              <div>
                <h5>{{ booking.movieTitle }}</h5>
                <span 
                  class="status-badge"
                  :class="booking.status === 'confirmed' ? 'bg-success' : 'bg-secondary'"
                >
                  {{ booking.status.toUpperCase() }}
                </span>
              </div>
              <div class="booking-code">
                Code: <strong>{{ booking.bookingCode }}</strong>
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label"><span class="mdi mdi-office-building"></span> Cinema:</span>
                <span>{{ booking.cinemaName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><span class="mdi mdi-calendar"></span> Date & Time:</span>
                <span>{{ formatDateTime(booking.date, booking.time) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><span class="mdi mdi-video"></span> Format:</span>
                <span>{{ booking.format }} • {{ booking.language }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><span class="mdi mdi-seat"></span> Seats:</span>
                <span class="seats-list">
                  <span 
                    v-for="seat in booking.seats" 
                    :key="`${seat.row}-${seat.number}`"
                    class="seat-chip-small"
                  >
                    {{ seat.row }}{{ seat.number }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><span class="mdi mdi-cash"></span> Total:</span>
                <span class="price-large">${{ booking.totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <div class="booking-footer" v-if="booking.status === 'confirmed'">
              <small class="text-muted">
                Booked on {{ formatBookingDate(booking.bookingDate) }}
              </small>
              <div class="booking-actions">
                <button 
                  @click="viewTicket(booking)"
                  class="btn btn-sm btn-outline-primary"
                >
                  <span class="mdi mdi-ticket"></span> View Ticket
                </button>
                <button 
                  v-if="canCancelBooking(booking)"
                  @click="cancelBooking(booking.id)"
                  class="btn btn-sm btn-outline-danger"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liked Movies Tab -->
      <div v-if="activeTab === 'liked'" class="tab-content">
        <h3 class="mb-4">Liked Movies</h3>

        <div v-if="likedMovies.length === 0" class="empty-state">
          <div class="empty-icon"><span class="mdi mdi-heart"></span></div>
          <h4>No liked movies yet</h4>
          <p>Start liking movies to build your collection!</p>
          <router-link to="/movies" class="btn btn-primary">Browse Movies</router-link>
        </div>

        <div v-else class="movies-grid">
          <div 
            v-for="movie in likedMovies" 
            :key="movie.id"
            class="movie-card"
            @click="goToMovie(movie.id)"
          >
            <img :src="movie.poster" :alt="movie.title" class="movie-poster" />
            <div class="movie-info">
              <h5>{{ movie.title }}</h5>
              <div class="movie-meta">
                <span class="badge bg-warning text-dark"><span class="mdi mdi-star"></span> {{ movie.rating }}</span>
                <span class="badge bg-secondary">{{ movie.year }}</span>
              </div>
              <p class="movie-genres">
                {{ movie.genre.join(', ') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-if="activeTab === 'reviews'" class="tab-content">
        <h3 class="mb-4">My Reviews</h3>

        <div v-if="userReviews.length === 0" class="empty-state">
          <div class="empty-icon"><span class="mdi mdi-star"></span></div>
          <h4>No reviews yet</h4>
          <p>Share your thoughts about the movies you've watched!</p>
          <router-link to="/movies" class="btn btn-primary">Browse Movies</router-link>
        </div>

        <div v-else class="reviews-list">
          <div 
            v-for="review in userReviews" 
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <div>
                <h5 @click="goToMovie(review.movieId)" class="movie-title-link">
                  {{ getMovieTitleByReview(review.movieId) }}
                </h5>
                <div class="review-rating">
                  <span v-html="getStars(review.rating)"></span>
                  <span class="rating-number">{{ review.rating }}/5</span>
                </div>
              </div>
              <div class="review-date">
                {{ formatReviewDate(review.date) }}
              </div>
            </div>
            <h6 class="review-title">{{ review.title }}</h6>
            <p class="review-content">{{ review.content }}</p>
            <div class="review-footer">
              <span class="helpful-count"><span class="mdi mdi-thumb-up"></span> {{ review.helpful }} found helpful</span>
              <div>
                <button @click="editReview(review)" class="btn btn-sm btn-outline-primary me-2">
                  Edit
                </button>
                <button @click="deleteReview(review.id)" class="btn btn-sm btn-outline-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Modal -->
    <div v-if="showTicketModal" class="modal-overlay" @click.self="showTicketModal = false">
      <div class="modal-content ticket-modal">
        <button @click="showTicketModal = false" class="btn-close-modal">×</button>
        
        <div class="ticket-design">
          <div class="ticket-header">
            <h3><span class="mdi mdi-movie-open"></span> CinemaHub</h3>
            <p class="booking-code-large">{{ selectedTicket.bookingCode }}</p>
          </div>

          <div class="ticket-body">
            <h4>{{ selectedTicket.movieTitle }}</h4>
            
            <div class="ticket-info-grid">
              <div class="ticket-info-item">
                <span class="label">Cinema</span>
                <span class="value">{{ selectedTicket.cinemaName }}</span>
              </div>
              <div class="ticket-info-item">
                <span class="label">Screen</span>
                <span class="value">{{ selectedTicket.screenNumber }}</span>
              </div>
              <div class="ticket-info-item">
                <span class="label">Date</span>
                <span class="value">{{ formatDate(selectedTicket.date) }}</span>
              </div>
              <div class="ticket-info-item">
                <span class="label">Time</span>
                <span class="value">{{ selectedTicket.time }}</span>
              </div>
              <div class="ticket-info-item">
                <span class="label">Format</span>
                <span class="value">{{ selectedTicket.format }}</span>
              </div>
              <div class="ticket-info-item">
                <span class="label">Language</span>
                <span class="value">{{ selectedTicket.language }}</span>
              </div>
            </div>

            <div class="ticket-seats">
              <span class="label">Seats</span>
              <div class="seats-display">
                <span 
                  v-for="seat in selectedTicket.seats" 
                  :key="`${seat.row}-${seat.number}`"
                  class="seat-badge-large"
                >
                  {{ seat.row }}{{ seat.number }}
                </span>
              </div>
            </div>

            <div class="qr-code">
              <div class="qr-placeholder">
                <div class="qr-grid">
                  <!-- Mock QR code -->
                  <div v-for="i in 64" :key="i" class="qr-pixel" :class="{ filled: Math.random() > 0.5 }"></div>
                </div>
              </div>
              <p class="text-muted small mt-2">Scan at cinema entrance</p>
            </div>
          </div>

          <div class="ticket-footer">
            <p class="text-muted small mb-0">
              Present this ticket at the cinema. Valid for single entry only.
            </p>
          </div>
        </div>

        <button @click="downloadTicket" class="btn btn-primary w-100 mt-3">
          <span class="mdi mdi-download"></span> Download Ticket
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService'
import bookingService from '../services/bookingService'
import moviesService from '../services/moviesService'
import reviewService from '../services/reviewService'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const user = ref(null)
    const bookings = ref([])
    const likedMovies = ref([])
    const userReviews = ref([])
    const activeTab = ref('bookings')
    const bookingFilter = ref('all')
    const showTicketModal = ref(false)
    const selectedTicket = ref(null)

    const tabs = [
      { id: 'bookings', label: 'Bookings', icon: 'mdi-ticket' },
      { id: 'liked', label: 'Liked Movies', icon: 'mdi-heart' },
      { id: 'reviews', label: 'Reviews', icon: 'mdi-star' }
    ]

    const loadUserData = async () => {
      user.value = authService.getCurrentUser()
      if (!user.value) {
        router.push('/login')
        return
      }

      // Load bookings
      bookings.value = bookingService.getUserBookings(user.value.username)
      bookings.value.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))

      // Load liked movies
      await moviesService.loadMovies()
      const allMovies = moviesService.getAllMovies()
      const likedMovieIds = JSON.parse(localStorage.getItem('likedMovies') || '[]')
      likedMovies.value = allMovies.filter(movie => likedMovieIds.includes(movie.id))

      // Load user reviews
      userReviews.value = reviewService.getReviews().filter(r => r.username === user.value.username)
    }

    const confirmedBookings = computed(() => {
      return bookings.value.filter(b => b.status === 'confirmed')
    })

    const filteredBookings = computed(() => {
      let filtered = bookings.value

      if (bookingFilter.value === 'upcoming') {
        filtered = filtered.filter(b => !isPastBooking(b) && b.status === 'confirmed')
      } else if (bookingFilter.value === 'past') {
        filtered = filtered.filter(b => isPastBooking(b) && b.status === 'confirmed')
      } else if (bookingFilter.value === 'cancelled') {
        filtered = filtered.filter(b => b.status === 'cancelled')
      }

      return filtered
    })

    const likedMoviesCount = computed(() => likedMovies.value.length)
    const userReviewsCount = computed(() => userReviews.value.length)
    
    const totalSpent = computed(() => {
      return confirmedBookings.value.reduce((sum, b) => sum + b.totalPrice, 0)
    })

    const isPastBooking = (booking) => {
      const bookingDateTime = new Date(`${booking.date} ${booking.time}`)
      return bookingDateTime < new Date()
    }

    const canCancelBooking = (booking) => {
      if (booking.status !== 'confirmed') return false
      
      const bookingDateTime = new Date(`${booking.date} ${booking.time}`)
      const now = new Date()
      const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60)
      
      return hoursDifference >= 24
    }

    const formatDateTime = (date, time) => {
      const dateObj = new Date(date)
      return `${dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })} at ${time}`
    }

    const formatDate = (date) => {
      const dateObj = new Date(date)
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }

    const formatBookingDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
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

    const cancelBooking = (bookingId) => {
      if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        bookingService.cancelBooking(bookingId)
        bookings.value = bookingService.getUserBookings(user.value.username)
      }
    }

    const viewTicket = (booking) => {
      selectedTicket.value = booking
      showTicketModal.value = true
    }

    const downloadTicket = () => {
      alert('Ticket download feature would be implemented here. In a real app, this would generate a PDF ticket.')
    }

    const goToMovie = (movieId) => {
      router.push(`/movies/${movieId}`)
    }

    const getMovieTitleByReview = (movieId) => {
      const movie = moviesService.getMovieById(movieId)
      return movie ? movie.title : 'Unknown Movie'
    }

    const getStars = (rating) => {
      return '<span class="mdi mdi-star"></span>'.repeat(rating) + '<span class="mdi mdi-star-outline"></span>'.repeat(5 - rating)
    }

    const editReview = (review) => {
      router.push({ 
        name: 'MovieDetail', 
        params: { id: review.movieId },
        query: { editReview: review.id }
      })
    }

    const deleteReview = (reviewId) => {
      if (confirm('Are you sure you want to delete this review?')) {
        reviewService.deleteReview(reviewId)
        userReviews.value = reviewService.getReviews().filter(r => r.username === user.value.username)
      }
    }

    onMounted(() => {
      loadUserData()
    })

    return {
      user,
      bookings,
      likedMovies,
      userReviews,
      activeTab,
      bookingFilter,
      tabs,
      showTicketModal,
      selectedTicket,
      confirmedBookings,
      filteredBookings,
      likedMoviesCount,
      userReviewsCount,
      totalSpent,
      isPastBooking,
      canCancelBooking,
      formatDateTime,
      formatDate,
      formatBookingDate,
      formatReviewDate,
      cancelBooking,
      viewTicket,
      downloadTicket,
      goToMovie,
      getMovieTitleByReview,
      getStars,
      editReview,
      deleteReview
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-background) 0%, var(--color-background-soft) 100%);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vt-c-purple) 0%, var(--vt-c-green) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.profile-info h2 {
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.profile-info p{
    color: var(--text-muted) !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vt-c-purple);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--color-text);
  font-size: 0.9rem;
}

.profile-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--vt-c-purple);
}

.tab-button.active {
  color: var(--vt-c-purple);
  border-bottom-color: var(--vt-c-purple);
}

.tab-content h3 {
  color: var(--color-heading);
  font-size: 1.8rem;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.booking-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.booking-card.cancelled {
  opacity: 0.6;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.booking-header h5 {
  color: var(--color-heading);
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.booking-code {
  text-align: right;
  color: var(--color-text);
}

.booking-code strong {
  color: var(--vt-c-purple);
  font-size: 1.1rem;
}

.booking-details {
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: var(--color-text);
}

.detail-label {
  font-weight: 600;
}

.seats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.seat-chip-small {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--vt-c-purple);
  color: white;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.price-large {
  color: var(--vt-c-green);
  font-weight: 700;
  font-size: 1.2rem;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-actions {
  display: flex;
  gap: 0.5rem;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.movie-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
}

.movie-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
}

.movie-info {
  padding: 1rem;
}

.movie-info h5 {
  color: var(--color-heading);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.movie-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.movie-genres {
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.movie-title-link {
  color: var(--vt-c-purple);
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.movie-title-link:hover {
  text-decoration: underline;
}

.review-rating {
  font-size: 1.1rem;
  margin-top: 0.25rem;
}

.rating-number {
  font-size: 0.9rem;
  color: var(--color-text);
  margin-left: 0.5rem;
}

.review-date {
  color: var(--color-text);
  font-size: 0.9rem;
}

.review-title {
  font-size: 1.1rem;
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
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.helpful-count {
  color: var(--color-text);
}

/* Ticket Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
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
  max-width: 500px;
  padding: 2rem;
  position: relative;
}

.btn-close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ticket-design {
  background: white;
  color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
}

.ticket-header {
  background: linear-gradient(135deg, var(--vt-c-purple) 0%, #6d28d9 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.ticket-header h3 {
  margin-bottom: 0.5rem;
}

.booking-code-large {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 2px;
}

.ticket-body {
  padding: 2rem;
}

.ticket-body h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.ticket-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ticket-info-item {
  display: flex;
  flex-direction: column;
}

.ticket-info-item .label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.ticket-info-item .value {
  font-weight: 600;
  color: #1a1a1a;
}

.ticket-seats {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.ticket-seats .label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.seats-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.seat-badge-large {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--vt-c-purple);
  color: white;
  border-radius: 6px;
  font-weight: 600;
}

.qr-code {
  text-align: center;
  padding: 1.5rem 0;
}

.qr-placeholder {
  display: inline-block;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  width: 120px;
  height: 120px;
}

.qr-pixel {
  background: white;
}

.qr-pixel.filled {
  background: #1a1a1a;
}

.ticket-footer {
  padding: 1rem 2rem;
  background: #f9fafb;
  text-align: center;
  border-top: 2px dashed #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .tab-button {
    border-bottom: 1px solid var(--color-border);
  }

  .tab-button.active {
    background: rgba(139, 92, 246, 0.1);
  }

  .booking-header {
    flex-direction: column;
    gap: 1rem;
  }

  .booking-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .ticket-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
