<template>
  <div class="movies-page">
    <div class="container py-5">
      <!-- Page Header -->
      <div class="page-header text-center mb-5">
        <h1 class="page-title">Browse Movies</h1>
        <p class="page-subtitle">Discover your next favorite film</p>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-section mb-4">
        <div class="row g-3">
          <div class="col-lg-4 col-md-6 col-sm-12">
            <label for="searchQuery" class="form-label">Search Movies</label>
            <input
              type="text"
              id="searchQuery"
              v-model="searchQuery"
              class="form-control"
              placeholder="Search by title, director, or description..."
              aria-label="Search movies"
              @input="performSearch"
            />
          </div>
          
          <div class="col-lg-2 col-md-6 col-sm-12">
            <label for="genreFilter" class="form-label">Genre</label>
            <select
              id="genreFilter"
              v-model="filters.genre"
              class="form-select"
              aria-label="Filter by genre"
              @change="performSearch"
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Crime">Crime</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
              <option value="Adventure">Adventure</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6 col-sm-12">
            <label for="minRating" class="form-label">Min Rating</label>
            <select
              id="minRating"
              v-model="filters.minRating"
              class="form-select"
              aria-label="Filter by minimum rating"
              @change="performSearch"
            >
              <option value="">Any Rating</option>
              <option value="9.0">9.0+</option>
              <option value="8.5">8.5+</option>
              <option value="8.0">8.0+</option>
              <option value="7.5">7.5+</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6 col-sm-12">
            <label for="sortBy" class="form-label">Sort By</label>
            <select
              id="sortBy"
              v-model="filters.sortBy"
              class="form-select"
              aria-label="Sort movies"
              @change="performSearch"
            >
              <option value="rating">Rating</option>
              <option value="year">Year</option>
              <option value="likes">Most Liked</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-12 col-sm-12 d-flex align-items-end">
            <button @click="resetFilters" class="btn btn-outline-secondary w-100">
              Reset Filters
            </button>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-12 d-flex justify-content-between align-items-center">
            <span class="text-muted">
              Showing {{ paginatedMovies.length }} of {{ filteredMovies.length }} movies
            </span>
            <button
              v-if="isAuthenticated"
              @click="showAddMovieModal = true"
              class="btn btn-primary"
            >
              <span class="me-2">+</span> Add Movie
            </button>
          </div>
        </div>
      </div>

      <!-- Movies Grid -->
      <div class="movies-grid">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="paginatedMovies.length === 0" class="no-results text-center py-5">
          <div class="no-results-icon"><span class="mdi mdi-movie-open"></span></div>
          <h3>No movies found</h3>
          <p class="text-muted">Try adjusting your search filters</p>
        </div>

        <div v-else class="row g-4">
          <div
            v-for="movie in paginatedMovies"
            :key="movie.id"
            class="col-lg-3 col-md-4 col-sm-6 col-12"
          >
            <div class="movie-card">
              <div class="movie-poster-container" @click="viewMovieDetails(movie)">
                <img
                  :src="movie.poster"
                  :alt="movie.title"
                  class="movie-poster"
                />
                <div class="movie-overlay">
                  <button
                    class="btn btn-sm btn-light"
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              <div class="movie-info">
                <h3 class="movie-title" :title="movie.title">{{ movie.title }}</h3>
                <div class="movie-meta">
                  <span class="movie-year">{{ movie.year }}</span>
                  <span class="movie-rating">
                    <span class="rating-star mdi mdi-star"></span>
                    {{ movie.rating }}
                  </span>
                </div>
                <div class="movie-genres">
                  <span
                    v-for="genre in movie.genre.slice(0, 2)"
                    :key="genre"
                    class="genre-badge"
                  >
                    {{ genre }}
                  </span>
                </div>
                <div class="movie-actions">
                  <button
                    @click="toggleLike(movie)"
                    class="btn-like"
                    :class="{ liked: hasUserLiked(movie.id) }"
                    :aria-label="hasUserLiked(movie.id) ? 'Unlike movie' : 'Like movie'"
                    :disabled="!isAuthenticated"
                  >
                    <span class="like-icon mdi" :class="hasUserLiked(movie.id) ? 'mdi-heart' : 'mdi-heart-outline'"></span>
                    <span class="like-count">{{ movie.likes }}</span>
                  </button>
                  
                  <div v-if="canEditMovie(movie)" class="edit-actions">
                    <button
                      @click="editMovie(movie)"
                      class="btn btn-sm btn-outline-primary"
                      aria-label="Edit movie"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteMovie(movie)"
                      class="btn btn-sm btn-outline-danger"
                      aria-label="Delete movie"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section mt-5">
        <nav aria-label="Movies pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                aria-label="Previous page"
              >
                Previous
              </button>
            </li>
            
            <li
              v-for="page in displayedPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <button
                class="page-link"
                @click="changePage(page)"
                :aria-label="'Go to page ' + page"
                :aria-current="currentPage === page ? 'page' : null"
              >
                {{ page }}
              </button>
            </li>
            
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button
                class="page-link"
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                aria-label="Next page"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Add/Edit Movie Modal -->
    <div
      v-if="showAddMovieModal"
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingMovie ? 'Edit Movie' : 'Add New Movie' }}</h3>
          <button @click="closeModal" class="btn-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveMovie">
            <div class="mb-3">
              <label for="movieTitle" class="form-label">Title *</label>
              <input
                type="text"
                id="movieTitle"
                v-model="movieForm.title"
                class="form-control"
                required
                aria-required="true"
              />
            </div>
            
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="movieYear" class="form-label">Year *</label>
                <input
                  type="number"
                  id="movieYear"
                  v-model="movieForm.year"
                  class="form-control"
                  min="1900"
                  max="2100"
                  required
                  aria-required="true"
                />
              </div>
              <div class="col-md-6">
                <label for="movieRating" class="form-label">Rating (0-10) *</label>
                <input
                  type="number"
                  id="movieRating"
                  v-model="movieForm.rating"
                  class="form-control"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div class="mb-3">
              <label for="movieGenres" class="form-label">Genres (comma separated) *</label>
              <input
                type="text"
                id="movieGenres"
                v-model="movieForm.genreString"
                class="form-control"
                placeholder="e.g., Action, Drama, Thriller"
                required
                aria-required="true"
              />
            </div>

            <div class="mb-3">
              <label for="movieDirector" class="form-label">Director *</label>
              <input
                type="text"
                id="movieDirector"
                v-model="movieForm.director"
                class="form-control"
                required
                aria-required="true"
              />
            </div>

            <div class="mb-3">
              <label for="movieDuration" class="form-label">Duration *</label>
              <input
                type="text"
                id="movieDuration"
                v-model="movieForm.duration"
                class="form-control"
                placeholder="e.g., 142 min"
                required
                aria-required="true"
              />
            </div>

            <div class="mb-3">
              <label for="moviePoster" class="form-label">Poster URL *</label>
              <input
                type="url"
                id="moviePoster"
                v-model="movieForm.poster"
                class="form-control"
                placeholder="https://..."
                required
                aria-required="true"
              />
            </div>

            <div class="mb-3">
              <label for="movieDescription" class="form-label">Description *</label>
              <textarea
                id="movieDescription"
                v-model="movieForm.description"
                class="form-control"
                rows="4"
                required
                aria-required="true"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingMovie ? 'Update' : 'Add' }} Movie
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moviesService from '../services/moviesService'
import authService from '../services/authService'

export default {
  name: 'MoviesPage',
  data() {
    return {
      movies: [],
      filteredMovies: [],
      searchQuery: '',
      filters: {
        genre: '',
        minRating: '',
        sortBy: 'rating'
      },
      currentPage: 1,
      itemsPerPage: 12,
      loading: false,
      showAddMovieModal: false,
      editingMovie: null,
      movieForm: this.getEmptyMovieForm()
    }
  },
  computed: {
    isAuthenticated() {
      return authService.isAuthenticated()
    },
    currentUser() {
      return authService.getCurrentUser()
    },
    totalPages() {
      return Math.ceil(this.filteredMovies.length / this.itemsPerPage)
    },
    paginatedMovies() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredMovies.slice(start, end)
    },
    displayedPages() {
      const pages = []
      const maxPagesToShow = 5
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2))
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1)
      
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  methods: {
    getEmptyMovieForm() {
      return {
        title: '',
        year: new Date().getFullYear(),
        rating: 0,
        genreString: '',
        director: '',
        duration: '',
        poster: '',
        description: ''
      }
    },
    async loadMovies() {
      this.loading = true
      try {
        this.movies = await moviesService.getAllMovies()
        this.performSearch()
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        this.loading = false
      }
    },
    async performSearch() {
      this.filteredMovies = await moviesService.searchMovies(this.searchQuery, this.filters)
      this.currentPage = 1
    },
    resetFilters() {
      this.searchQuery = ''
      this.filters = {
        genre: '',
        minRating: '',
        sortBy: 'rating'
      }
      this.performSearch()
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    hasUserLiked(movieId) {
      return moviesService.hasUserLiked(movieId)
    },
    async toggleLike(movie) {
      if (!this.isAuthenticated) {
        alert('Please login to like movies')
        return
      }

      try {
        const updatedMovie = await moviesService.toggleLike(movie.id)
        const index = this.movies.findIndex(m => m.id === movie.id)
        if (index !== -1) {
          this.movies[index] = updatedMovie
        }
        this.performSearch()
      } catch (error) {
        console.error('Error toggling like:', error)
      }
    },
    canEditMovie(movie) {
      if (!this.isAuthenticated) return false
      const user = this.currentUser
      return user.role === 'admin' || user.username === movie.addedBy
    },
    editMovie(movie) {
      this.editingMovie = movie
      this.movieForm = {
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        genreString: movie.genre.join(', '),
        director: movie.director,
        duration: movie.duration,
        poster: movie.poster,
        description: movie.description
      }
      this.showAddMovieModal = true
    },
    async deleteMovie(movie) {
      if (!confirm(`Are you sure you want to delete "${movie.title}"?`)) {
        return
      }

      try {
        await moviesService.deleteMovie(movie.id)
        this.loadMovies()
      } catch (error) {
        console.error('Error deleting movie:', error)
        alert('Failed to delete movie')
      }
    },
    async saveMovie() {
      try {
        const movieData = {
          title: this.movieForm.title,
          year: parseInt(this.movieForm.year),
          rating: parseFloat(this.movieForm.rating),
          genre: this.movieForm.genreString.split(',').map(g => g.trim()),
          director: this.movieForm.director,
          duration: this.movieForm.duration,
          poster: this.movieForm.poster,
          description: this.movieForm.description
        }

        if (this.editingMovie) {
          await moviesService.updateMovie(this.editingMovie.id, movieData)
        } else {
          await moviesService.addMovie(movieData, this.currentUser.username)
        }

        this.closeModal()
        this.loadMovies()
      } catch (error) {
        console.error('Error saving movie:', error)
        alert('Failed to save movie')
      }
    },
    closeModal() {
      this.showAddMovieModal = false
      this.editingMovie = null
      this.movieForm = this.getEmptyMovieForm()
    },
    viewMovieDetails(movie) {
      this.$router.push(`/movies/${movie.id}`)
    }
  },
  mounted() {
    window.scrollTo(0, 0)
    this.loadMovies()
  }
}
</script>

<style scoped>
/* Existing styles from News page can be reused */
.movies-page {
  background-color: var(--darker-bg);
  min-height: 100vh;
}

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

.search-section {
  background: rgba(139, 92, 246, 0.05);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.search-section .form-control::placeholder {
  color: var(--text-muted) !important;
}

.search-section .text-muted {
  color: var(--text-muted) !important;
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
}

.form-select option {
  background-color: var(--dark-bg);
  color: var(--text-light);
}

/* Movie Cards */
.movie-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.movie-poster-container {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster {
  transform: scale(1.1);
}

.movie-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.movie-info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.movie-year,
.movie-rating {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.rating-star {
  color: #fbbf24;
}

.movie-genres {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.genre-badge {
  background-color: rgba(139, 92, 246, 0.2);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.movie-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-like {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-like:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.05);
}

.btn-like.liked {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
}

.btn-like:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.like-icon {
  font-size: 1.25rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--dark-bg);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--text-light);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.btn-close:hover {
  background: rgba(139, 92, 246, 0.2);
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Pagination */
.pagination {
  gap: 0.5rem;
}

.page-link {
  background-color: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.page-link:hover:not(:disabled) {
  background-color: rgba(139, 92, 246, 0.2);
  border-color: var(--primary-color);
  color: var(--text-light);
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.page-item.disabled .page-link {
  background-color: rgba(139, 92, 246, 0.05);
  border-color: rgba(139, 92, 246, 0.1);
  color: var(--text-muted);
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .search-section {
    padding: 1.5rem;
  }

  .movie-info {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .search-section {
    padding: 1rem;
  }

  .edit-actions {
    flex-direction: column;
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
