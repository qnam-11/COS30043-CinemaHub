<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 col-md-12">
            <h1 class="hero-title">Welcome to CinemaHub</h1>
            <p class="hero-subtitle">
              Book tickets for the latest movies at premium theaters near you. 
              Your ultimate destination for hassle-free cinema ticket booking. 
              Enjoy the magic of cinema with reserved seating, multiple formats, 
              and the best movie-going experience.
            </p>
            <div class="hero-buttons">
              <router-link to="/movies" class="btn btn-primary btn-lg me-3">
                <i class="bi bi-play-fill"></i> Book Tickets
              </router-link>
              <router-link to="/about" class="btn btn-outline-light btn-lg">
                Learn More
              </router-link>
            </div>
          </div>
          <div class="col-lg-6 col-md-12 mt-4 mt-lg-0">
            <img 
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop" 
              alt="Cinema Experience" 
              class="hero-image img-fluid rounded shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">Why Choose CinemaHub?</h2>
        <div class="row g-4">
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="feature-card">
              <div class="feature-icon">🎬</div>
              <h3>Wide Selection</h3>
              <p>Book tickets for thousands of movies across all genres at multiple theaters</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="feature-card">
              <div class="feature-icon">🎫</div>
              <h3>Easy Booking</h3>
              <p>Reserve your seats in advance with our simple and secure booking system</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="feature-card">
              <div class="feature-icon">🪑</div>
              <h3>Choose Your Seats</h3>
              <p>Select your preferred seats from our interactive seat map</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3>Digital Tickets</h3>
              <p>Get instant e-tickets with QR codes on your mobile device</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase Section -->
    <section class="showcase-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">Experience Cinema Like Never Before</h2>
        <div class="row">
          <div class="col-md-6 col-sm-12 mb-4">
            <router-link to="/movies" class="showcase-card">
              <img 
                src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&h=500&fit=crop" 
                alt="Movie Theater" 
                class="showcase-image img-fluid rounded"
              />
              <div class="showcase-overlay">
                <h3>Premium Theaters</h3>
                <p>Book tickets at the best cinemas near you</p>
              </div>
            </router-link>
          </div>
          <div class="col-md-6 col-sm-12 mb-4">
            <router-link to="/news" class="showcase-card">
              <img 
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&h=500&fit=crop" 
                alt="Streaming Service" 
                class="showcase-image img-fluid rounded"
              />
              <div class="showcase-overlay">
                <h3>Latest Movies</h3>
                <p>Book tickets for new releases and upcoming films</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  mounted() {
    window.scrollTo(0, 0)
  }
}
</script>

<style scoped>
.home-page {
  background-color: var(--darker-bg);
}

/* Hero Section */
.hero-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.1));
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.hero-buttons .btn {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.hero-buttons .btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
}

.hero-buttons .btn-outline-light {
  border: 2.5px solid rgba(236, 234, 234, 0.959);
}

.hero-buttons .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

.hero-buttons .btn-outline-light:hover {
  background-color: rgba(236, 234, 234, 0.959);
  box-shadow: 0 10px 25px rgba(218, 203, 249, 0.2);
  transform: translateY(-2px);
}

.hero-image {
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
}

.hero-image:hover {
  transform: scale(1.02);
}

/* Features Section */
.features-section {
  background-color: var(--dark-bg);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-light);
}

.feature-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 92, 246, 0.2);
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
}

/* Showcase Section */
.showcase-section {
  background-color: var(--darker-bg);
}

.showcase-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  cursor: pointer;
  height: 100%;
  display: block;
  text-decoration: none;
}

.showcase-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.showcase-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  padding: 2rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.showcase-card:hover .showcase-image {
  transform: scale(1.1);
}

.showcase-card:hover .showcase-overlay {
  transform: translateY(0);
}

.showcase-overlay h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.showcase-overlay p {
  color: var(--text-muted);
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-buttons .btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .hero-buttons .btn {
    display: block;
    width: 100%;
    margin: 0.5rem 0 !important;
  }
}
</style>
