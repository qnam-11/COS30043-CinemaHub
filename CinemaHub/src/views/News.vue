<template>
  <div class="news-page">
    <div class="container py-5">
      <!-- Page Header -->
      <div class="page-header text-center mb-5">
        <h1 class="page-title">Latest News & Updates</h1>
        <p class="page-subtitle">Stay informed about the latest from CinemaHub</p>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-section mb-4">
        <div class="row g-3">
          <div class="col-lg-4 col-md-6 col-sm-12">
            <label for="searchTitle" class="form-label">Search by Title</label>
            <input
              type="text"
              id="searchTitle"
              v-model="searchFilters.title"
              class="form-control"
              placeholder="Enter title..."
              aria-label="Search by title"
            />
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12">
            <label for="searchContent" class="form-label">Search by Content</label>
            <input
              type="text"
              id="searchContent"
              v-model="searchFilters.content"
              class="form-control"
              placeholder="Enter content..."
              aria-label="Search by content"
            />
          </div>
          <div class="col-lg-2 col-md-6 col-sm-12">
            <label for="searchDate" class="form-label">Date</label>
            <input
              type="date"
              id="searchDate"
              v-model="searchFilters.date"
              class="form-control"
              aria-label="Search by date"
            />
          </div>
          <div class="col-lg-2 col-md-6 col-sm-12">
            <label for="searchCategory" class="form-label">Category</label>
            <select
              id="searchCategory"
              v-model="searchFilters.category"
              class="form-select"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Features">Features</option>
              <option value="Company">Company</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12">
            <button @click="resetFilters" class="btn btn-outline-secondary">
              Reset Filters
            </button>
            <span class="ms-3 text-muted">
              Showing {{ filteredNews.length }} of {{ allNews.length }} articles
            </span>
          </div>
        </div>
      </div>

      <!-- News List -->
      <div class="news-list">
        <div v-if="paginatedNews.length === 0" class="no-results text-center py-5">
          <div class="no-results-icon">📰</div>
          <h3>No news articles found</h3>
          <p class="text-muted">Try adjusting your search filters</p>
        </div>
        
        <div v-else class="row g-4">
          <div 
            v-for="news in paginatedNews" 
            :key="news.id"
            class="col-lg-6 col-md-6 col-sm-12"
          >
            <div class="news-card">
              <div class="news-header">
                <span class="news-category" :class="getCategoryClass(news.category)">
                  {{ news.category }}
                </span>
                <span class="news-date">{{ formatDate(news.date) }}</span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-content">{{ news.content }}</p>
              <button class="btn btn-link read-more">
                Read More →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section mt-5">
        <nav aria-label="News pagination">
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
        
        <div class="text-center text-muted mt-3">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsPage',
  data() {
    return {
      allNews: [],
      searchFilters: {
        title: '',
        content: '',
        date: '',
        category: ''
      },
      currentPage: 1,
      itemsPerPage: 6
    }
  },
  computed: {
    filteredNews() {
      return this.allNews.filter(news => {
        const matchesTitle = news.title.toLowerCase().includes(this.searchFilters.title.toLowerCase())
        const matchesContent = news.content.toLowerCase().includes(this.searchFilters.content.toLowerCase())
        const matchesDate = !this.searchFilters.date || news.date === this.searchFilters.date
        const matchesCategory = !this.searchFilters.category || news.category === this.searchFilters.category
        
        return matchesTitle && matchesContent && matchesDate && matchesCategory
      })
    },
    totalPages() {
      return Math.ceil(this.filteredNews.length / this.itemsPerPage)
    },
    paginatedNews() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredNews.slice(start, end)
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
    async loadNews() {
      try {
        const response = await fetch('/news-data.json')
        this.allNews = await response.json()
      } catch (error) {
        console.error('Error loading news:', error)
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },
    getCategoryClass(category) {
      const categoryClasses = {
        'Technology': 'category-technology',
        'Business': 'category-business',
        'Features': 'category-features',
        'Company': 'category-company',
        'Entertainment': 'category-entertainment'
      }
      return categoryClasses[category] || ''
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    resetFilters() {
      this.searchFilters = {
        title: '',
        content: '',
        date: '',
        category: ''
      }
      this.currentPage = 1
    }
  },
  watch: {
    filteredNews() {
      this.currentPage = 1
    }
  },
  mounted() {
    this.loadNews()
  }
}
</script>

<style scoped>
.news-page {
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

/* Search Section */
.search-section {
  background: rgba(139, 92, 246, 0.05);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
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

.form-control::placeholder {
  color: var(--text-muted);
}

.form-select option {
  background-color: var(--dark-bg);
  color: var(--text-light);
}

.search-section .text-muted {
  color: var(--text-muted) !important;
}

/* News Cards */
.news-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.news-category {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.category-technology {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.category-business {
  background-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.category-features {
  background-color: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.category-company {
  background-color: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.category-entertainment {
  background-color: rgba(236, 72, 153, 0.2);
  color: #f472b6;
}

.news-date {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.news-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.news-content {
  color: var(--text-muted);
  line-height: 1.8;
  flex-grow: 1;
  margin-bottom: 1rem;
}

.read-more {
  color: var(--primary-color);
  font-weight: 600;
  padding: 0;
  text-decoration: none;
  transition: all 0.3s ease;
}

.read-more:hover {
  color: var(--secondary-color);
  transform: translateX(5px);
}

/* No Results */
.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-results h3 {
  color: var(--text-light);
  margin-bottom: 0.5rem;
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
  
  .news-card {
    padding: 1.5rem;
  }
  
  .news-title {
    font-size: 1.25rem;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .search-section {
    padding: 1rem;
  }
  
  .page-link {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
