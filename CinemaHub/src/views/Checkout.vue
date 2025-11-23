<template>
  <div class="checkout-page" v-if="cart">
    <div class="container py-5">
      <h2 class="page-title mb-4">Checkout</h2>

      <div class="row">
        <!-- Booking Details -->
        <div class="col-lg-7 mb-4">
          <div class="checkout-section">
            <h4>Booking Details</h4>
            
            <div class="movie-summary">
              <h5>{{ cart.movieTitle }}</h5>
              <div class="booking-info">
                <p><strong>Cinema:</strong> {{ cart.cinemaName }}</p>
                <p><strong>Screen:</strong> {{ cart.screenNumber }}</p>
                <p><strong>Date & Time:</strong> {{ formatDateTime(cart.date, cart.time) }}</p>
                <p><strong>Format:</strong> {{ cart.format }}</p>
                <p><strong>Language:</strong> {{ cart.language }}</p>
              </div>
            </div>

            <div class="seats-summary">
              <h5>Selected Seats</h5>
              <div class="seat-list">
                <span 
                  v-for="seat in cart.seats" 
                  :key="`${seat.row}-${seat.number}`"
                  class="seat-badge"
                >
                  {{ seat.row }}{{ seat.number }}
                </span>
              </div>
            </div>

            <div class="price-details">
              <h5>Price Breakdown</h5>
              <div 
                v-for="(group, type) in groupedSeats" 
                :key="type"
                class="price-row"
              >
                <span>{{ getTicketLabel(type) }} × {{ group.length }}</span>
                <span>${{ (group[0].price * group.length).toFixed(2) }}</span>
              </div>
              <div class="price-row total">
                <strong>Total Amount</strong>
                <strong>${{ cart.totalPrice.toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="checkout-section mt-4">
            <h4>Payment Method</h4>
            <p class="text-muted mb-3">
              <small>This is a mock payment. Transactions can not be made.</small>
            </p>

            <div class="payment-methods mb-4">
              <div 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="payment-method"
                :class="{ 'selected': selectedPayment === method.id }"
                @click="selectedPayment = method.id"
              >
                <input 
                  type="radio" 
                  :id="method.id" 
                  :value="method.id"
                  v-model="selectedPayment"
                />
                <label :for="method.id">
                  <span class="payment-icon mdi" :class="method.icon"></span>
                  <span class="payment-name">{{ method.name }}</span>
                </label>
              </div>
            </div>

            <!-- Mock Card Form -->
            <div v-if="selectedPayment === 'card'" class="card-form">
              <div class="mb-3">
                <label class="form-label">Card Number</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="cardDetails.number"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                />
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Expiry Date</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="cardDetails.expiry"
                    placeholder="MM/YY"
                    maxlength="5"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">CVV</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="cardDetails.cvv"
                    placeholder="123"
                    maxlength="3"
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Cardholder Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="cardDetails.name"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <!-- Digital Wallet Info -->
            <div v-if="selectedPayment === 'paypal' || selectedPayment === 'gpay'" class="wallet-info">
              <p class="text-muted">
                You will be redirected to {{ getPaymentName(selectedPayment) }} to complete your payment.
              </p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-5">
          <div class="order-summary">
            <h4>Order Summary</h4>
            
            <div class="summary-item">
              <span>Tickets ({{ cart.seats.length }})</span>
              <span>${{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>Booking Fee</span>
              <span>${{ bookingFee.toFixed(2) }}</span>
            </div>
            <div class="summary-item total">
              <strong>Total</strong>
              <strong>${{ grandTotal.toFixed(2) }}</strong>
            </div>

            <button 
              @click="confirmBooking" 
              class="btn btn-primary w-100 btn-lg mt-4"
              :disabled="processing || !canCheckout"
            >
              <span v-if="processing"><span class="mdi mdi-loading mdi-spin"></span> Processing...</span>
              <span v-else><span class="mdi mdi-ticket"></span> Confirm & Pay ${{ grandTotal.toFixed(2) }}</span>
            </button>

            <!-- Terms -->
            <div class="terms-section mt-4">
              <p class="text-muted small">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy. 
                All sales are final. No refunds will be issued within 24 hours of showtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccess">
      <div class="modal-content success-modal">
        <div class="success-icon"><span class="mdi mdi-check-circle"></span></div>
        <h3>Booking Confirmed!</h3>
        <p class="booking-code">Booking Code: <strong>{{ bookingCode }}</strong></p>
        <p class="text-muted">A confirmation email has been sent to your registered email address.</p>
        
        <div class="booking-details-modal">
          <p><strong>{{ cart.movieTitle }}</strong></p>
          <p>{{ cart.cinemaName }} - Screen {{ cart.screenNumber }}</p>
          <p>{{ formatDateTime(cart.date, cart.time) }}</p>
          <p>Seats: {{ cart.seats.map(s => `${s.row}${s.number}`).join(', ') }}</p>
        </div>

        <div class="modal-actions">
          <button @click="viewBooking" class="btn btn-primary">View Booking</button>
          <button @click="closeSuccess" class="btn btn-outline-secondary">Continue Browsing</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bookingService from '../services/bookingService'
import cinemaService from '../services/cinemaService'
import authService from '../services/authService'

export default {
  name: 'Checkout',
  setup() {
    const router = useRouter()
    const cart = ref(null)
    const processing = ref(false)
    const showSuccessModal = ref(false)
    const bookingCode = ref('')

    const selectedPayment = ref('card')
    const cardDetails = ref({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    })

    const paymentMethods = [
      { id: 'card', name: 'Credit/Debit Card', icon: 'mdi-credit-card' },
      { id: 'paypal', name: 'PayPal', icon: 'mdi-paypal' },
      { id: 'gpay', name: 'Google Pay', icon: 'mdi-google' }
    ]

    const bookingFee = 2.50

    const loadCart = () => {
      cart.value = bookingService.getCart()
      if (!cart.value) {
        router.push('/movies')
      }
    }

    const groupedSeats = computed(() => {
      if (!cart.value) return {}
      
      const grouped = {}
      cart.value.seats.forEach(seat => {
        if (!grouped[seat.type]) {
          grouped[seat.type] = []
        }
        grouped[seat.type].push(seat)
      })
      return grouped
    })

    const grandTotal = computed(() => {
      return cart.value ? cart.value.totalPrice + bookingFee : 0
    })

    const canCheckout = computed(() => {
      if (!selectedPayment.value) return false
      
      if (selectedPayment.value === 'card') {
        return (
          cardDetails.value.number.length >= 13 &&
          cardDetails.value.expiry.length === 5 &&
          cardDetails.value.cvv.length === 3 &&
          cardDetails.value.name.length > 0
        )
      }
      
      return true
    })

    const getTicketLabel = (type) => {
      const labels = {
        adult: 'Adult',
        child: 'Child',
        student: 'Student',
        senior: 'Senior'
      }
      return labels[type] || type
    }

    const getPaymentName = (id) => {
      const method = paymentMethods.find(m => m.id === id)
      return method ? method.name : ''
    }

    const formatDateTime = (date, time) => {
      const dateObj = new Date(date)
      const dateStr = dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
      return `${dateStr} at ${time}`
    }

    const confirmBooking = async () => {
      if (!canCheckout.value) return

      processing.value = true

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      try {
        // Create booking
        const booking = bookingService.createBooking(cart.value)
        bookingCode.value = booking.bookingCode

        // Mark seats as occupied for this showtime
        cinemaService.markSeatsAsOccupied(cart.value.showtimeId, cart.value.seats)

        // Clear cart
        bookingService.clearCart()

        // Show success modal
        showSuccessModal.value = true
      } catch (error) {
        alert('Error creating booking: ' + error.message)
      } finally {
        processing.value = false
      }
    }

    const viewBooking = () => {
      showSuccessModal.value = false
      router.push('/profile')
    }

    const closeSuccess = () => {
      showSuccessModal.value = false
      router.push('/movies')
    }

    onMounted(() => {
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }
      loadCart()
    })

    return {
      cart,
      processing,
      showSuccessModal,
      bookingCode,
      selectedPayment,
      cardDetails,
      paymentMethods,
      bookingFee,
      groupedSeats,
      grandTotal,
      canCheckout,
      getTicketLabel,
      getPaymentName,
      formatDateTime,
      confirmBooking,
      viewBooking,
      closeSuccess
    }
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-background) 0%, var(--color-background-soft) 100%);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.checkout-section {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.checkout-section h4 {
  margin-bottom: 1.5rem;
  color: var(--color-heading);
  font-size: 1.5rem;
}

.checkout-section h5 {
  margin-bottom: 1rem;
  color: var(--color-heading);
  font-size: 1.2rem;
  margin-top: 1.5rem;
}

.checkout-section h5:first-of-type {
  margin-top: 0;
}

.checkout-section p {
  color: #d4deeb92 !important;
}

.movie-summary h5 {
  color: var(--vt-c-purple);
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.booking-info p {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.seat-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.seat-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--vt-c-purple);
  color: white;
  border-radius: 20px;
  font-weight: 600;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.price-row.total {
  border-top: 2px solid var(--color-border);
  border-bottom: none;
  font-size: 1.3rem;
  padding-top: 1rem;
  margin-top: 0.5rem;
  color: var(--color-heading);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--vt-c-purple);
}

.payment-method.selected {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--vt-c-purple);
}

.payment-method label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  margin: 0;
}

.payment-method input[type="radio"] {
  width: 20px;
  height: 20px;
}

.payment-icon {
  font-size: 2rem;
}

.payment-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-heading);
}

.card-form, .wallet-info {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-top: 1rem;
}

.order-summary {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  position: sticky;
  top: 20px;
}

.order-summary h4 {
  margin-bottom: 1.5rem;
  color: var(--color-heading);
  font-size: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.1rem;
}

.summary-item.total {
  border-top: 2px solid var(--color-border);
  border-bottom: none;
  font-size: 1.5rem;
  padding-top: 1.5rem;
  margin-top: 1rem;
  color: var(--color-heading);
}

.security-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.badge-item {
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  color: var(--vt-c-green);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.terms-section p {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-top: 1px solid var(--color-border);
  color: #d4deeb92 !important;
}

/* Success Modal */
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-modal h3 {
  color: var(--vt-c-green);
  margin-bottom: 1rem;
}

.booking-code {
  font-size: 1.2rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 8px;
}

.booking-code strong {
  color: var(--vt-c-purple);
  font-size: 1.4rem;
}

.booking-details-modal {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: left;
}

.booking-details-modal p {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 992px) {
  .order-summary {
    position: static;
  }
}
</style>
