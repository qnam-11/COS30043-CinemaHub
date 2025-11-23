import { createRouter, createWebHistory } from 'vue-router'
import authService from '../services/authService'
import Home from '../views/Home.vue'
import News from '../views/News.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Movies from '../views/Movies.vue'
import MovieDetail from '../views/MovieDetail.vue'
import SeatSelection from '../views/SeatSelection.vue'
import Checkout from '../views/Checkout.vue'
import Profile from '../views/Profile.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/news',
        name: 'News',
        component: News
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guestOnly: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { guestOnly: true }
    },
    {
        path: '/movies',
        name: 'Movies',
        component: Movies
    },
    {
        path: '/movies/:id',
        name: 'MovieDetail',
        component: MovieDetail
    },
    {
        path: '/seat-selection/:showtimeId',
        name: 'SeatSelection',
        component: SeatSelection,
        meta: { requiresAuth: true }
    },
    {
        path: '/checkout',
        name: 'Checkout',
        component: Checkout,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // Always scroll to top when navigating to MovieDetail
        if (to.name === 'MovieDetail') {
            return { top: 0, behavior: 'smooth' }
        }
        // If there's a saved position (browser back/forward), use it
        if (savedPosition) {
            return savedPosition
        }
        // Otherwise scroll to top
        return { top: 0, behavior: 'smooth' }
    }
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const isAuthenticated = authService.isAuthenticated()

    // Redirect authenticated users away from login/register pages
    if (to.meta.guestOnly && isAuthenticated) {
        next('/movies')
        return
    }

    // Redirect unauthenticated users from protected pages
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    next()
})

export default router
