<template>
  <div class="seat-selection-page" v-if="showtime && movie">
    <div class="container py-4">
      <!-- Header -->
      <div class="selection-header mb-4">
        <button @click="goBack" class="btn btn-outline-secondary mb-3">
          ← Back to Movie
        </button>
        <h2>Select Your Seats</h2>
        <div class="movie-info-bar">
          <h4>{{ movie.title }}</h4>
          <p class="mb-1">
            <strong>{{ cinemaName }}</strong> - Screen {{ showtime.screenNumber }}
          </p>
          <p class="mb-0">
            {{ formatDate(showtime.date) }} at {{ showtime.time }} • {{ showtime.format }} • {{ showtime.language }}
          </p>
        </div>
      </div>

      <div class="row">
        <!-- Seat Map Section -->
        <div class="col-lg-8 mb-4">
          <div class="seat-map-container">
            <div class="screen-indicator">
              <div class="screen">SCREEN</div>
            </div>

            <!-- Legend -->
            <div class="seat-legend mb-4">
              <div class="legend-item">
                <div class="seat available"></div>
                <span>Available</span>
              </div>
              <div class="legend-item">
                <div class="seat selected"></div>
                <span>Selected by You</span>
              </div>
              <div class="legend-item">
                <div class="seat locked"></div>
                <span>Locked by Others</span>
              </div>
              <div class="legend-item">
                <div class="seat occupied"></div>
                <span>Occupied</span>
              </div>
              <div class="legend-item" v-if="isConnected">
                <span class="realtime-badge">Live</span>
              </div>
            </div>

            <!-- Seat Grid -->
            <div class="seat-grid">
              <div 
                v-for="row in seatLayout" 
                :key="row.row" 
                class="seat-row"
              >
                <div class="row-label">{{ row.row }}</div>
                <div class="seats">
                  <div 
                    v-for="seat in row.seats" 
                    :key="`${row.row}-${seat.number}`"
                    class="seat"
                    :class="{
                      'available': !seat.occupied && !isSeatSelected(row.row, seat.number) && !isSeatLocked(row.row, seat.number),
                      'selected': isSeatSelected(row.row, seat.number),
                      'locked': isSeatLocked(row.row, seat.number),
                      'occupied': seat.occupied
                    }"
                    @click="toggleSeat(row.row, seat.number)"
                    :title="isSeatLocked(row.row, seat.number) ? 'Locked by another user' : ''"
                  >
                    {{ seat.number }}
                  </div>
                </div>
                <div class="row-label">{{ row.row }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Summary Section -->
        <div class="col-lg-4">
          <div class="booking-summary">
            <h4>Booking Summary</h4>

            <!-- Ticket Types -->
            <div class="ticket-types mb-4">
              <h5>Select Ticket Types</h5>
              <div 
                v-for="(type, key) in ticketTypes" 
                :key="key" 
                class="ticket-type-item"
              >
                <div class="ticket-info">
                  <strong>{{ type.label }}</strong>
                  <div class="ticket-price">${{ showtime.price[key].toFixed(2) }}</div>
                </div>
                <div class="ticket-quantity">
                  <button 
                    @click="decreaseTicket(key)" 
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="type.count === 0"
                  >
                    -
                  </button>
                  <span class="mx-3">{{ type.count }}</span>
                  <button 
                    @click="increaseTicket(key)" 
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="getTotalTickets() >= selectedSeats.length || getTotalTickets() >= 10"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Selected Seats -->
            <div class="selected-seats-list mb-4" v-if="selectedSeats.length > 0">
              <h5>Selected Seats ({{ selectedSeats.length }})</h5>
              <div class="seat-chips">
                <span 
                  v-for="seat in selectedSeats" 
                  :key="`${seat.row}-${seat.number}`"
                  class="seat-chip"
                >
                  {{ seat.row }}{{ seat.number }}
                  <button @click="removeSeat(seat)" class="remove-seat">x</button>
                </span>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="price-breakdown mb-4">
              <div 
                v-for="(type, key) in ticketTypes" 
                :key="`price-${key}`"
                v-show="type.count > 0"
                class="price-item"
              >
                <span>{{ type.label }} × {{ type.count }}</span>
                <span>${{ (showtime.price[key] * type.count).toFixed(2) }}</span>
              </div>
              <div class="price-item total">
                <strong>Total</strong>
                <strong>${{ totalPrice.toFixed(2) }}</strong>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button 
                @click="proceedToCheckout" 
                class="btn btn-primary w-100 mb-2"
                :disabled="!canProceed"
              >
                Proceed to Checkout
              </button>
              <button @click="clearSelection" class="btn btn-outline-secondary w-100">
                Clear Selection
              </button>
            </div>

            <!-- Validation Messages -->
            <div class="alert alert-info mt-3" v-if="validationMessage">
              {{ validationMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moviesService from '../services/moviesService'
import cinemaService from '../services/cinemaService'
import bookingService from '../services/bookingService'
import authService from '../services/authService'
import { useRealtimeSeats } from '../composables/useRealtimeSeats'

export default {
  name: 'SeatSelection',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const showtime = ref(null)
    const movie = ref(null)
    const cinemaName = ref('')
    const selectedSeats = ref([])
    const seatLayout = ref([])
    
    const ticketTypes = ref({
      adult: { label: 'Adult', count: 0 },
      child: { label: 'Child (under 12)', count: 0 },
      student: { label: 'Student', count: 0 },
      senior: { label: 'Senior (65+)', count: 0 }
    })

    const validationMessage = ref('')

    // Get current user for real-time features
    const currentUser = authService.getCurrentUser()
    const userId = currentUser ? currentUser.username : `guest-${Date.now()}`

    // Initialize real-time seat management
    // This composable handles WebSocket connection and seat locking
    const showtimeId = parseInt(route.params.showtimeId)
    const {
      isConnected,
      connectionError,
      lockedSeats,
      lockSeat,
      unlockSeat,
      unlockSeats,
      isSeatLockedByOthers,
      confirmBooking
    } = useRealtimeSeats(showtimeId.toString(), userId)

    const loadData = async () => {
      const showtimeId = parseInt(route.params.showtimeId)
      const movieId = parseInt(route.query.movieId)

      await cinemaService.loadShowtimes()
      await cinemaService.loadCinemas()
      await moviesService.loadMovies()

      showtime.value = cinemaService.getShowtimeById(showtimeId)
      movie.value = moviesService.getMovieById(movieId)

      if (!showtime.value || !movie.value) {
        router.push('/movies')
        return
      }

      const cinema = cinemaService.getCinemaById(showtime.value.cinemaId)
      cinemaName.value = cinema ? cinema.name : 'Unknown Cinema'

      generateSeatLayout()
    }

    const generateSeatLayout = () => {
      // Generate a realistic seat layout (10 rows, 12 seats each = 120 seats)
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      const seatsPerRow = 12

      // Get consistent occupied seats for this showtime
      const occupiedSeatsArray = cinemaService.getOccupiedSeats(showtime.value.id)
      const occupiedSeats = new Set(occupiedSeatsArray)

      seatLayout.value = rows.map(row => ({
        row,
        seats: Array.from({ length: seatsPerRow }, (_, i) => ({
          number: i + 1,
          occupied: occupiedSeats.has(`${row}-${i + 1}`)
        }))
      }))
    }

    const toggleSeat = (row, number) => {
      // Check if seat is occupied
      const rowData = seatLayout.value.find(r => r.row === row)
      const seat = rowData.seats.find(s => s.number === number)
      
      if (seat.occupied) {
        return
      }

      const seatId = `${row}-${number}`

      // REAL-TIME FEATURE: Check if seat is locked by another user
      if (isSeatLockedByOthers(seatId)) {
        validationMessage.value = `Seat ${row}${number} is currently being selected by another user`
        setTimeout(() => validationMessage.value = '', 3000)
        return
      }

      const seatIndex = selectedSeats.value.findIndex(
        s => s.row === row && s.number === number
      )

      if (seatIndex > -1) {
        // Remove seat - unlock it in real-time
        selectedSeats.value.splice(seatIndex, 1)
        unlockSeat(seatId)
      } else {
        // Add seat (max 10 seats)
        if (selectedSeats.value.length >= 10) {
          validationMessage.value = 'Maximum 10 seats can be selected at once'
          setTimeout(() => validationMessage.value = '', 3000)
          return
        }

        // REAL-TIME FEATURE: Try to lock the seat
        const lockSuccess = lockSeat(seatId)
        if (lockSuccess) {
          selectedSeats.value.push({ row, number })
        } else {
          validationMessage.value = `Seat ${row}${number} was just selected by another user`
          setTimeout(() => validationMessage.value = '', 3000)
        }
      }
    }

    const isSeatSelected = (row, number) => {
      return selectedSeats.value.some(s => s.row === row && s.number === number)
    }

    // REAL-TIME FEATURE: Check if seat is locked by another user
    const isSeatLocked = (row, number) => {
      const seatId = `${row}-${number}`
      return isSeatLockedByOthers(seatId)
    }

    const removeSeat = (seat) => {
      const index = selectedSeats.value.findIndex(
        s => s.row === seat.row && s.number === seat.number
      )
      if (index > -1) {
        selectedSeats.value.splice(index, 1)
      }
    }

    const increaseTicket = (type) => {
      if (getTotalTickets() >= selectedSeats.value.length) {
        validationMessage.value = 'Please select more seats first'
        setTimeout(() => validationMessage.value = '', 3000)
        return
      }
      if (getTotalTickets() >= 10) {
        validationMessage.value = 'Maximum 10 tickets allowed'
        setTimeout(() => validationMessage.value = '', 3000)
        return
      }
      ticketTypes.value[type].count++
    }

    const decreaseTicket = (type) => {
      if (ticketTypes.value[type].count > 0) {
        ticketTypes.value[type].count--
      }
    }

    const getTotalTickets = () => {
      return Object.values(ticketTypes.value).reduce((sum, type) => sum + type.count, 0)
    }

    const clearSelection = () => {
      // REAL-TIME FEATURE: Unlock all selected seats
      const seatIds = selectedSeats.value.map(s => `${s.row}-${s.number}`)
      unlockSeats(seatIds)

      selectedSeats.value = []
      Object.keys(ticketTypes.value).forEach(key => {
        ticketTypes.value[key].count = 0
      })
      validationMessage.value = ''
    }

    const goBack = () => {
      router.push(`/movies/${movie.value.id}`)
    }

    const proceedToCheckout = () => {
      if (!canProceed.value) return

      // Prepare booking data
      const seats = selectedSeats.value.map((seat, index) => {
        // Assign ticket types to seats
        let type = 'adult'
        let assignedCount = 0
        
        for (const [key, value] of Object.entries(ticketTypes.value)) {
          if (assignedCount + value.count > index) {
            type = key
            break
          }
          assignedCount += value.count
        }

        return {
          row: seat.row,
          number: seat.number,
          type,
          price: showtime.value.price[type]
        }
      })

      const bookingData = {
        movieId: movie.value.id,
        movieTitle: movie.value.title,
        showtimeId: showtime.value.id,
        cinemaId: showtime.value.cinemaId,
        cinemaName: cinemaName.value,
        date: showtime.value.date,
        time: showtime.value.time,
        format: showtime.value.format,
        language: showtime.value.language,
        screenNumber: showtime.value.screenNumber,
        seats,
        totalPrice: totalPrice.value
      }

      // REAL-TIME FEATURE: Confirm booking to convert temporary locks to permanent
      // This keeps the seats locked even after the user completes checkout
      const seatIds = selectedSeats.value.map(s => `${s.row}-${s.number}`)
      confirmBooking(seatIds)

      // Save to cart
      bookingService.saveCart(bookingData)

      // Navigate to checkout
      router.push('/checkout')
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }

    // Computed properties
    const totalPrice = computed(() => {
      let total = 0
      Object.entries(ticketTypes.value).forEach(([key, type]) => {
        total += showtime.value.price[key] * type.count
      })
      return total
    })

    const canProceed = computed(() => {
      const totalTickets = getTotalTickets()
      return (
        selectedSeats.value.length > 0 &&
        totalTickets > 0 &&
        totalTickets === selectedSeats.value.length
      )
    })

    onMounted(() => {
      loadData()
    })

    return {
      showtime,
      movie,
      cinemaName,
      selectedSeats,
      seatLayout,
      ticketTypes,
      validationMessage,
      totalPrice,
      canProceed,
      toggleSeat,
      isSeatSelected,
      isSeatLocked,
      removeSeat,
      increaseTicket,
      decreaseTicket,
      getTotalTickets,
      clearSelection,
      goBack,
      proceedToCheckout,
      formatDate,
      // Real-time connection status
      isConnected,
      connectionError
    }
  }
}
</script>

<style scoped>
.seat-selection-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-background) 0%, var(--color-background-soft) 100%);
}

.selection-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.movie-info-bar {
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.movie-info-bar h4 {
  color: var(--vt-c-purple);
  margin-bottom: 0.5rem;
}

.seat-map-container {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow-x: auto;
}

.screen-indicator {
  text-align: center;
  margin-bottom: 3rem;
}

.screen {
  display: inline-block;
  padding: 1rem 16rem;
  background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
  border-radius: 50% 50% 0 0 / 20% 20% 0 0;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
}

.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  min-width: fit-content;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
}

.seats {
  display: flex;
  gap: 0.5rem;
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 4px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.seat.available {
  background: #10b981;
  color: white;
}

.seat.available:hover {
  background: #059669;
  transform: scale(1.1);
}

.seat.selected {
  background: var(--vt-c-purple);
  color: white;
  border-color: #fbbf24;
  transform: scale(1.1);
}

.seat.occupied {
  background: #6b7280;
  color: #9ca3af;
  cursor: not-allowed;
}

.seat.locked {
  background: #f59e0b;
  color: white;
  cursor: not-allowed;
  animation: pulse-locked 2s ease-in-out infinite;
}

@keyframes pulse-locked {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.realtime-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.50rem 1rem;
  background: rgba(88, 239, 68, 0.2);
  color: #58ef44;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.booking-summary {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  position: sticky;
  top: 20px;
}

.booking-summary h4 {
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.booking-summary h5 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.ticket-types {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.ticket-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.ticket-info {
  flex: 1;
}

.ticket-price {
  color: var(--vt-c-green);
  font-weight: 600;
  font-size: 1.1rem;
}

.ticket-quantity {
  display: flex;
  align-items: center;
}

.selected-seats-list {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.seat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.seat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vt-c-purple);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.remove-seat {
  background: none;
  border: none;
  color: rgba(255, 0, 0, 0.542);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.remove-seat:hover {
  color: rgb(255, 0, 0);
}

.price-breakdown {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: var(--color-text);
}

.price-item.total {
  font-size: 1.2rem;
  color: var(--color-heading);
  border-top: 2px solid var(--color-border);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.action-buttons {
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 992px) {
  .booking-summary {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .seat-map-container {
    padding: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .screen {
    padding: 0.75rem 8rem;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .seat {
    width: 28px;
    height: 28px;
    font-size: 0.6rem;
  }

  .seats {
    gap: 0.4rem;
  }

  .seat-row {
    gap: 0.4rem;
  }

  .seat-legend {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .legend-item {
    font-size: 0.85rem;
  }

  .row-label {
    width: 20px;
    font-size: 0.8rem;
  }

  .booking-summary {
    padding: 1.5rem;
  }

  .ticket-type-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .ticket-quantity {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .seat-map-container {
    padding: 0.75rem;
    margin: 0 -0.5rem;
  }

  .screen {
    padding: 0.5rem 6rem;
    font-size: 0.85rem;
  }

  .seat {
    width: 24px;
    height: 24px;
    font-size: 0.55rem;
  }

  .seats {
    gap: 0.3rem;
  }

  .seat-row {
    gap: 0.3rem;
  }

  .row-label {
    width: 18px;
    font-size: 0.75rem;
  }

  .selection-header h2 {
    font-size: 1.5rem;
  }

  .movie-info-bar {
    padding: 1rem;
  }

  .movie-info-bar h4 {
    font-size: 1.1rem;
  }

  .seat-chip {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
