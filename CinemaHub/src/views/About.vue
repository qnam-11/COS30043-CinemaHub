<template>
  <div class="about-page">
    <div class="container py-5">
      <!-- Page Header -->
      <div class="page-header text-center mb-5">
        <h1 class="page-title">About CinemaHub</h1>
        <p class="page-subtitle">Your Ultimate Cinema Ticket Booking Platform</p>
      </div>

      <!-- About Content -->
      <div class="row mb-5">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="about-content">
            <h2 class="section-heading">Our Story</h2>
            <p>
              CinemaHub was founded in 2020 with a simple yet powerful vision: to make cinema ticket booking 
              effortless and accessible to everyone. We believe that great movies deserve to be experienced 
              on the big screen, and we're here to make that happen with just a few clicks.
            </p>
            <p>
              Our platform connects moviegoers with premium theaters across the country, offering a seamless 
              booking experience from movie selection to seat reservation. Whether you're looking for the latest 
              blockbuster, an indie gem, or a classic rerelease, CinemaHub brings you instant access to tickets 
              at your favorite theaters with multiple formats including 2D, 3D, IMAX, and 4DX.
            </p>
            <p>
              Today, CinemaHub serves over 5 million movie enthusiasts across 150 cities, partnering with 
              hundreds of theaters to offer the best selection of showtimes and seating options. Join us on 
              this incredible journey as we continue to revolutionize how people book cinema tickets.
            </p>
          </div>
        </div>
      </div>

      <!-- Personalization Section -->
      <div class="row mb-5">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="personalization-section">
            <h2 class="section-heading text-center mb-4">Personalize Your Experience</h2>
            
            <!-- Name Input -->
            <div class="name-input-section mb-4">
              <div class="row g-3">
                <div class="col-md-6 col-sm-12">
                  <label for="firstName" class="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="firstName"
                    class="form-control"
                    placeholder="Enter your first name"
                    aria-label="First name"
                  />
                </div>
                <div class="col-md-6 col-sm-12">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="lastName"
                    class="form-control"
                    placeholder="Enter your last name"
                    aria-label="Last name"
                  />
                </div>
              </div>
              
              <!-- Welcome Message -->
              <div v-if="fullName" class="welcome-message mt-4">
                <div class="welcome-card">
                  <!-- <div class="welcome-icon">👋</div> -->
                  <h3>{{ welcomeMessage }}</h3>
                  <p>We're excited to have you here at CinemaHub!</p>
                </div>
              </div>
            </div>

            <!-- Image Selection -->
            <div class="image-selection-section">
              <h3 class="section-subheading mb-3">Choose Your Viewing Mood</h3>
              <p class="text-muted mb-3">Select an atmosphere that matches your viewing preference</p>
              
              <div class="radio-group">
                <div class="form-check custom-radio">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="imageChoice"
                    id="mountainChoice"
                    value="mountain"
                    v-model="selectedImage"
                    aria-label="Select mountain view"
                  />
                  <label class="form-check-label" for="mountainChoice">
                    <!-- <span class="radio-icon">🏔️</span> -->
                    <span class="radio-text">Mountain Retreat</span>
                    <span class="radio-description">Peaceful and serene</span>
                  </label>
                </div>
                
                <div class="form-check custom-radio">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="imageChoice"
                    id="oceanChoice"
                    value="ocean"
                    v-model="selectedImage"
                    aria-label="Select ocean view"
                  />
                  <label class="form-check-label" for="oceanChoice">
                    <!-- <span class="radio-icon">🌊</span> -->
                    <span class="radio-text">Ocean Paradise</span>
                    <span class="radio-description">Calm and relaxing</span>
                  </label>
                </div>
              </div>

              <!-- Display Selected Image -->
              <div v-if="selectedImage" class="selected-image-container mt-4">
                <transition name="fade">
                  <div class="image-card">
                    <img 
                      :src="currentImage" 
                      :alt="selectedImage === 'mountain' ? 'Mountain landscape' : 'Ocean landscape'"
                      class="img-fluid rounded"
                    />
                    <div class="image-caption">
                      <h4>{{ imageCaption }}</h4>
                      <p>{{ imageDescription }}</p>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="statistics-section">
        <div class="row g-4">
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="stat-card">
              <div class="stat-number">50M+</div>
              <div class="stat-label">Active Subscribers</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="stat-card">
              <div class="stat-number">150+</div>
              <div class="stat-label">Countries Served</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="stat-card">
              <div class="stat-number">10K+</div>
              <div class="stat-label">Movies & Shows</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="stat-card">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      firstName: '',
      lastName: '',
      selectedImage: ''
    }
  },
  computed: {
    fullName() {
      const first = this.firstName.trim()
      const last = this.lastName.trim()
      if (first && last) {
        return `${first} ${last}`
      } else if (first) {
        return first
      } else if (last) {
        return last
      }
      return ''
    },
    welcomeMessage() {
      if (this.fullName) {
        return `Welcome, ${this.fullName}!`
      }
      return ''
    },
    currentImage() {
      if (this.selectedImage === 'mountain') {
        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      } else if (this.selectedImage === 'ocean') {
        return 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop'
      }
      return ''
    },
    imageCaption() {
      return this.selectedImage === 'mountain' 
        ? 'Mountain Retreat' 
        : 'Ocean Paradise'
    },
    imageDescription() {
      return this.selectedImage === 'mountain'
        ? 'Experience tranquility with breathtaking mountain views'
        : 'Immerse yourself in the calming waves of the ocean'
    }
  },
  mounted() {
    window.scrollTo(0, 0)
  }
}
</script>

<style scoped>
.about-page {
  background-color: var(--darker-bg);
  min-height: 100vh;
}

/* Page Header */
.page-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
}

/* About Content */
.about-content {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.section-heading {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.section-subheading {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-light);
}

.about-content p {
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

/* Personalization Section */
.personalization-section {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.form-label {
  color: var(--text-light);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control {
  background-color: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: var(--text-light);
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-control:focus {
  background-color: rgba(15, 23, 42, 0.8);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.25);
  color: var(--text-light);
}

.form-control::placeholder {
  color: var(--text-muted);
}

.image-selection-section .text-muted {
  color: var(--text-muted) !important;
}

/* Welcome Message */
.welcome-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.1));
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(139, 92, 246, 0.3);
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.welcome-card h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.welcome-card p {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin: 0;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.custom-radio {
  flex: 1;
  min-width: 250px;
}

.custom-radio .form-check-input {
  display: none;
}

.custom-radio .form-check-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.custom-radio .form-check-input:checked + .form-check-label {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.1));
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.radio-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.radio-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.radio-description {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* Image Display */
.image-card {
  background: rgba(15, 23, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.image-card img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.image-caption {
  text-align: center;
}

.image-caption h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.image-caption p {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Statistics Section */
.statistics-section {
  margin-top: 4rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-muted);
  font-size: 1.1rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .about-content,
  .personalization-section {
    padding: 2rem;
  }
  
  .section-heading {
    font-size: 1.75rem;
  }
  
  .radio-group {
    flex-direction: column;
  }
  
  .custom-radio {
    min-width: 100%;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .about-content,
  .personalization-section {
    padding: 1.5rem;
  }
  
  .section-heading {
    font-size: 1.5rem;
  }
  
  .welcome-card h3 {
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-label {
    font-size: 1rem;
  }
}
</style>
