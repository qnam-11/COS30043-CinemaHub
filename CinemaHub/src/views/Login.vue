<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-12">
          <div class="auth-card">
            <div class="text-center mb-4">
              <h2 class="auth-title">Welcome Back</h2>
              <p class="auth-subtitle">Sign in to continue to CinemaHub</p>
            </div>

            <form @submit.prevent="handleLogin">

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

              <div class="handle-google-login mb-3 text-center">
                <GoogleLogin 
                  :callback="handleGoogleLogin" 
                  popup-type="TOKEN"
                  :disabled="isAnyLoading"
                >
                  <button type="button" class="btn btn-primary w-100" :disabled="isAnyLoading">
                    <svg style="width: 20px; height: 20px; margin-right: 8px; vertical-align: text-bottom;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#FFFFFF"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#FFFFFF"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FFFFFF"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#FFFFFF"/>
                    </svg>
                    <span v-if="googleLoading">Connecting...</span>
                    <span v-else>Sign in with Google</span>
                  </button>
                </GoogleLogin>
              </div>
             
              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

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
  margin: 0.75rem 0;
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

.handle-google-login {
  width: 100%;
}

.handle-google-login :deep(.google-btn-wrapper),
.handle-google-login :deep(div) {
  width: 100% !important;
  display: block;
}

.auth-link {
  color: #462b83;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: var(--primary-color);
}

.text-muted {
  color: var(--text-muted) !important;
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

@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
  }
}
</style>
