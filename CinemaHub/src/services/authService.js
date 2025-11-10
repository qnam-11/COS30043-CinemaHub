// Authentication service for managing user login/logout
class AuthService {
    constructor() {
        this.currentUser = this.loadUser()
        this.users = []
    }

    // Load user from localStorage
    loadUser() {
        const userStr = localStorage.getItem('currentUser')
        return userStr ? JSON.parse(userStr) : null
    }

    // Save user to localStorage
    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
        this.currentUser = user
    }

    // Remove user from localStorage
    removeUser() {
        localStorage.removeItem('currentUser')
        this.currentUser = null
    }

    // Load all users from JSON
    async loadUsers() {
        try {
            const response = await fetch('/users-data.json')
            this.users = await response.json()
        } catch (error) {
            console.error('Error loading users:', error)
            this.users = []
        }
    }

    // Register a new user
    async register(userData) {
        await this.loadUsers()

        // Check if username already exists
        if (this.users.find(u => u.username === userData.username)) {
            throw new Error('Username already exists')
        }

        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            throw new Error('Email already exists')
        }

        const newUser = {
            id: this.users.length + 1,
            username: userData.username,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: 'user'
        }

        this.users.push(newUser)

        // In a real app, this would save to a backend
        // For now, we'll just store in localStorage
        localStorage.setItem('users', JSON.stringify(this.users))

        return newUser
    }

    // Login user
    async login(username, password) {
        await this.loadUsers()

        // Check localStorage for registered users
        const storedUsers = localStorage.getItem('users')
        if (storedUsers) {
            this.users = [...this.users, ...JSON.parse(storedUsers)]
        }

        const user = this.users.find(
            u => u.username === username && u.password === password
        )

        if (!user) {
            throw new Error('Invalid username or password')
        }

        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }

        this.saveUser(userWithoutPassword)
        return userWithoutPassword
    }

    // Logout user
    logout() {
        this.removeUser()
    }

    // Check if user is logged in
    isAuthenticated() {
        return this.currentUser !== null
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin'
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser
    }
}

export default new AuthService()
