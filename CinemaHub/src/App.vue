<template>
  <div id="app" class="cinema-hub">
    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <span class="brand-icon mdi mdi-movie-open"></span>
          <span class="brand-text">CinemaHub</span>
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link" active-class="active">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/movies" class="nav-link" active-class="active">Movies</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/news" class="nav-link" active-class="active">News</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link" active-class="active">About</router-link>
            </li>
            
            <!-- User Menu -->
            <li v-if="isAuthenticated && currentUser" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle user-menu" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="user-icon mdi mdi-account-circle"></span>
                <span class="user-name">{{ currentUser.firstName }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li class="dropdown-header">
                  {{ currentUser.firstName }} {{ currentUser.lastName }}
                  <div class="small text-muted">{{ currentUser.email }}</div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    <span class="me-2 mdi mdi-account"></span> Profile
                  </router-link>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    <span class="me-2 mdi mdi-logout"></span> Logout
                  </a>
                </li>
              </ul>
            </li>
            
            <!-- Login/Register Links -->
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
            </li>
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link to="/register" class="nav-link btn-register">Sign Up</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view :key="$route.fullPath"></router-view>
    </main>

    <!-- Footer -->
    <footer class="footer bg-dark text-white py-4">
      <div class="container text-center">
        <p class="mb-0">&copy; 2025 CinemaHub. All rights reserved.</p>
        <p class="small mb-0">Your ultimate cinema ticket booking platform</p>
      </div>
    </footer>
  </div>
</template>

<script>
import authService from './services/authService'

export default {
  name: 'App',
  data() {
    return {
      currentUser: null
    }
  },
  computed: {
    isAuthenticated() {
      return this.currentUser !== null
    }
  },
  methods: {
    updateUser() {
      this.currentUser = authService.getCurrentUser()
    },
    handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        authService.logout()
        this.updateUser()
        this.$router.push('/')
      }
    }
  },
  watch: {
    $route: {
      handler() {
        this.updateUser()
      },
      immediate: true
    }
  },
  mounted() {
    this.updateUser()
    // Listen for storage changes (for logout in other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'currentUser' || e.key === 'accessToken') {
        this.updateUser()
      }
    })
  }
}
</script>

<style>
/* Global Styles */
:root {
  --primary-color: #8b5cf6;
  --secondary-color: #10b981;
  --dark-bg: #0f172a;
  --darker-bg: #020617;
  --text-light: #f1f5f9;
  --text-muted: #b7b1b1c4;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--darker-bg);
  color: var(--text-light);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation Styles */
.navbar {
  background-color: var(--dark-bg) !important;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light) !important;
  transition: color 0.3s ease;
}

.navbar-brand:hover {
  color: var(--primary-color) !important;
}

.brand-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.brand-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-link {
  color: var(--text-muted) !important;
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  margin: 0 0.25rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--text-light) !important;
  background-color: rgba(139, 92, 246, 0.1);
}

.nav-link.active {
  color: var(--primary-color) !important;
  background-color: rgba(139, 92, 246, 0.2);
}

.btn-register {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)) !important;
  color: white !important;
  font-weight: 600;
  padding: 0.5rem 1.5rem !important;
  border-radius: 20px;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  font-size: 1.25rem;
}

.dropdown-menu {
  background-color: var(--dark-bg);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.dropdown-header {
  color: var(--text-light);
  font-weight: 600;
}

.dropdown-item {
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--text-light);
}

.dropdown-divider {
  border-color: rgba(139, 92, 246, 0.2);
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
}

/* Footer */
.footer {
  background-color: var(--dark-bg) !important;
  margin-top: auto;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
}

/* Responsive Design */
@media (max-width: 991px) {
  .navbar-nav {
    padding: 1rem 0;
  }
  
  .nav-item {
    margin: 0.25rem 0;
  }

  .dropdown-menu {
    background-color: rgba(15, 23, 42, 0.95);
  }
}

@media (max-width: 768px) {
  .brand-text {
    font-size: 1.25rem;
  }
  
  .brand-icon {
    font-size: 1.5rem;
  }

  .user-name {
    display: none;
  }
}
</style>
