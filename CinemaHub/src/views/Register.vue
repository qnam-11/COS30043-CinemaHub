<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-12">
          <div class="auth-card">
            <div class="text-center mb-4">
              <div class="auth-icon"><span class="mdi mdi-movie-open"></span></div>
              <h2 class="auth-title">Join CinemaHub</h2>
              <p class="auth-subtitle">Create your account to start streaming</p>
            </div>

            <form @submit.prevent="handleRegister">
              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <div v-if="success" class="alert alert-success" role="alert">
                {{ success }}
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="formData.firstName"
                    class="form-control"
                    :class="{ 'is-invalid': errors.firstName }"
                    placeholder="Enter first name"
                    required
                    aria-label="First name"
                    aria-required="true"
                    @blur="validateField('firstName')"
                  />
                  <div v-if="errors.firstName" class="invalid-feedback">
                    {{ errors.firstName }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="formData.lastName"
                    class="form-control"
                    :class="{ 'is-invalid': errors.lastName }"
                    placeholder="Enter last name"
                    required
                    aria-label="Last name"
                    aria-required="true"
                    @blur="validateField('lastName')"
                  />
                  <div v-if="errors.lastName" class="invalid-feedback">
                    {{ errors.lastName }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="username" class="form-label">Username *</label>
                <input
                  type="text"
                  id="username"
                  v-model="formData.username"
                  class="form-control"
                  :class="{ 'is-invalid': errors.username }"
                  placeholder="Choose a username"
                  required
                  aria-label="Username"
                  aria-required="true"
                  @blur="validateField('username')"
                />
                <div v-if="errors.username" class="invalid-feedback">
                  {{ errors.username }}
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="Enter your email"
                  required
                  aria-label="Email"
                  aria-required="true"
                  @blur="validateField('email')"
                />
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password *</label>
                <input
                  type="password"
                  id="password"
                  v-model="formData.password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Create a password"
                  required
                  aria-label="Password"
                  aria-required="true"
                  @blur="validateField('password')"
                />
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
                <div class="form-text">
                  Password must be at least 6 characters long
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  placeholder="Confirm your password"
                  required
                  aria-label="Confirm password"
                  aria-required="true"
                  @blur="validateField('confirmPassword')"
                />
                <div v-if="errors.confirmPassword" class="invalid-feedback">
                  {{ errors.confirmPassword }}
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading || !isFormValid">
                <span v-if="loading">Creating Account...</span>
                <span v-else>Create Account</span>
              </button>

              <div class="text-center">
                <p class="text-muted">
                  Already have an account? 
                  <router-link to="/login" class="auth-link">Sign in</router-link>
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

export default {
  name: 'RegisterPage',
  data() {
    return {
      formData: {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {},
      error: '',
      success: '',
      loading: false
    }
  },
  computed: {
    isFormValid() {
      return (
        this.formData.firstName &&
        this.formData.lastName &&
        this.formData.username &&
        this.formData.email &&
        this.formData.password &&
        this.formData.confirmPassword &&
        Object.keys(this.errors).length === 0
      )
    }
  },
  methods: {
    validateField(field) {
      this.errors = { ...this.errors }
      delete this.errors[field]

      switch (field) {
        case 'firstName':
          if (!this.formData.firstName.trim()) {
            this.errors.firstName = 'First name is required'
          } else if (this.formData.firstName.trim().length < 2) {
            this.errors.firstName = 'First name must be at least 2 characters'
          }
          break

        case 'lastName':
          if (!this.formData.lastName.trim()) {
            this.errors.lastName = 'Last name is required'
          } else if (this.formData.lastName.trim().length < 2) {
            this.errors.lastName = 'Last name must be at least 2 characters'
          }
          break

        case 'username':
          if (!this.formData.username.trim()) {
            this.errors.username = 'Username is required'
          } else if (this.formData.username.trim().length < 3) {
            this.errors.username = 'Username must be at least 3 characters'
          } else if (!/^[a-zA-Z0-9_]+$/.test(this.formData.username)) {
            this.errors.username = 'Username can only contain letters, numbers, and underscores'
          }
          break

        case 'email':
          if (!this.formData.email.trim()) {
            this.errors.email = 'Email is required'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
            this.errors.email = 'Please enter a valid email address'
          }
          break

        case 'password':
          if (!this.formData.password) {
            this.errors.password = 'Password is required'
          } else if (this.formData.password.length < 6) {
            this.errors.password = 'Password must be at least 6 characters'
          }
          if (this.formData.confirmPassword && this.formData.password !== this.formData.confirmPassword) {
            this.errors.confirmPassword = 'Passwords do not match'
          } else {
            delete this.errors.confirmPassword
          }
          break

        case 'confirmPassword':
          if (!this.formData.confirmPassword) {
            this.errors.confirmPassword = 'Please confirm your password'
          } else if (this.formData.password !== this.formData.confirmPassword) {
            this.errors.confirmPassword = 'Passwords do not match'
          }
          break
      }
    },
    async handleRegister() {
      this.error = ''
      this.success = ''

      // Validate all fields
      Object.keys(this.formData).forEach(field => {
        if (field !== 'confirmPassword') {
          this.validateField(field)
        }
      })
      this.validateField('confirmPassword')

      if (!this.isFormValid) {
        this.error = 'Please fix all validation errors'
        return
      }

      this.loading = true

      try {
        await authService.register(this.formData)
        this.success = 'Registration successful! Redirecting...'
        // navigate to movies page after registration
        await this.$router.push('/movies')
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
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

.form-control.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  display: block;
  color: #fca5a5;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

.alert-success {
  background-color: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
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
