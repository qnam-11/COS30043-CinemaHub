<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-12">
          <div class="auth-card">
            <div class="text-center mb-4">
              <div class="auth-icon">🎬</div>
              <h2 class="auth-title">Welcome Back</h2>
              <p class="auth-subtitle">Sign in to continue to CinemaHub</p>
            </div>

            <form @submit.prevent="handleLogin">
            <GoogleLogin
                :callback="handleGoogleLogin"
                auto-login
                popup-type="TOKEN"
                :disabled="isAnyLoading"
              >
              </GoogleLogin>

              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  v-model="username"
                  class="form-control"
                  placeholder="Enter your username"
                  required
                  aria-label="Username"
                  aria-required="true"
                />
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  v-model="password"
                  class="form-control"
                  placeholder="Enter your password"
                  required
                  aria-label="Password"
                  aria-required="true"
                />
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
                <span v-if="loading">Signing in...</span>
                <span v-else>Sign In</span>
              </button>

              <div class="text-center">
                <p class="text-muted">
                  Don't have an account? 
                  <router-link to="/register" class="auth-link">Sign up</router-link>
                </p>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService'
import { GoogleLogin } from "vue3-google-login"

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false
    }
  },
  components: {
    GoogleLogin
  },
  computed: {
    isAnyLoading() {
      return this.loading || this.googleLoading
    }
  },
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false,
      googleLoading: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''
      this.loading = true

      try {
        await authService.login(this.username, this.password)
        // navigate to redirect (or movies) then reload the page so global state updates
        await this.$router.push(this.$route.query.redirect || '/movies')
        window.location.reload()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }

    ,
    async handleGoogleLogin(response) {
      // response may contain access_token or credential (id_token)
      this.error = ''
      this.googleLoading = true
      try {
        let profile = null
        if (response && response.access_token) {
          // fetch profile from Google userinfo endpoint
          const infoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(response.access_token)}`)
          if (!infoRes.ok) throw new Error('Failed to fetch Google profile')
          profile = await infoRes.json()
        } else if (response && response.credential) {
          // credential is an id_token
          const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(response.credential)}`)
          if (!infoRes.ok) throw new Error('Failed to verify Google id token')
          profile = await infoRes.json()
        } else {
          throw new Error('No Google token returned')
        }

        // profile should contain email, sub (google id), given_name, family_name
        const googleProfile = {
          email: profile.email,
          googleId: profile.sub || profile.id,
          firstName: profile.given_name || profile.name || '',
          lastName: profile.family_name || ''
        }

        await authService.googleLogin(googleProfile)
        // after successful login, navigate to home and reload so app state updates
        await this.$router.push('/')
        window.location.reload()
      } catch (err) {
        this.error = err.message || 'Google login failed'
      } finally {
        this.googleLoading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  background-color: var(--darker-bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.auth-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.auth-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: var(--text-muted);
  margin-bottom: 0;
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

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: var(--secondary-color);
}

.alert {
  border-radius: 8px;
  border: none;
}

.alert-danger {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.demo-credentials {
  margin-top: 2rem;
  padding: 1rem;
  background-color: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.demo-credentials code {
  color: var(--primary-color);
  background-color: rgba(139, 92, 246, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
  }
}
</style>
