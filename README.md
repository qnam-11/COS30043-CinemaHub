# CinemaHub - Movie Streaming & Booking Platform

A modern, full-stack web application for browsing movies and booking cinema tickets with real-time seat synchronization.

## Project Overview

CinemaHub is a responsive movie booking platform built with **Vue.js 3**, **Bun**, **Elysia**, and **Socket.IO**. The application features user authentication (including Google OAuth), movie management, and an advanced real-time seat booking system that prevents double bookings through WebSocket communication.

---

## Features

### Core Features
- **Movie Browsing** - Search, filter, and sort movies by genre, year, rating
- **Authentication** - Local registration/login + Google OAuth integration
- **Real-Time Seat Booking** - Live seat synchronization across multiple users
- **Movie Details** - Trailers, cast information, reviews, and showtimes
- **News Section** - Latest cinema updates and announcements
- **User Profiles** - Manage account and view booking history
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### Advanced Features (Stage 3)
- **WebSocket Communication** - Real-time seat locking with Socket.IO
- **Conflict Prevention** - First-come-first-serve seat reservation
- **Auto-Expiration** - 3-minute temporary locks with automatic cleanup
- **Auto-Reconnection** - Handles network interruptions gracefully
- **Visual Indicators** - 4 seat states with pulsing animations

---

## Technologies Used

### Frontend
- **Vue.js 3.5.22** - Progressive JavaScript framework with Composition API
- **Vue Router 4.6.3** - Client-side routing
- **Bootstrap 5.3.8** - Responsive CSS framework
- **Socket.IO Client 4.8.1** - WebSocket communication
- **Vite 7.1.7** - Fast build tool and dev server

### Backend
- **Bun** - Fast JavaScript runtime (alternative to Node.js)
- **Elysia** - Ergonomic web framework for Bun
- **Socket.IO 4.8.1** - Real-time bidirectional event-based communication
- **TypeScript** - Type-safe backend development

### Authentication & Security
- **jose 6.1.2** - JWT token generation/verification
- **bcryptjs 3.0.3** - Password hashing
- **vue3-google-login 2.0.34** - Google OAuth integration

---

## Prerequisites

Before running this application, ensure you have the following installed:

### Required Software

1. **Bun** (v1.0.0 or higher) - JavaScript runtime
   ```bash
   # Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1|iex"
   
   # macOS/Linux
   curl -fsSL https://bun.sh/install | bash
   
   # Verify installation
   bun --version
   ```

2. **Node.js** (v18.0.0 or higher) - Required for some npm packages
   - Download from: https://nodejs.org/
   - Verify: `node --version`

3. **Git** - Version control
   - Download from: https://git-scm.com/
   - Verify: `git --version`

### Optional (Recommended)
- **Visual Studio Code** - Code editor
- **Google Chrome** - For testing (any modern browser works)

---

## Getting Started

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/qnam-11/COS30043-CinemaHub.git

# Navigate to project directory
cd COS30043-CinemaHub/CinemaHub
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Alternative using Bun
bun install
```

This will install:
- Vue.js and related packages
- Socket.IO client and server
- Elysia backend framework
- Authentication libraries
- Bootstrap CSS framework

### Step 3: Configure Environment (Optional)

Create a `.env` file in the `CinemaHub` directory (optional for development):

```env
# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secrets (use strong secrets in production)
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

> **Note:** The app works without `.env` file using default localhost settings.

---

## Running the Application

### Option 1: Run Everything Together (Recommended)

```bash
# Start both backend and frontend simultaneously
bun app
```

This command starts:
- **Backend Server** (Port 3000) - REST API with Elysia
- **Socket.IO Server** (Port 3001) - Real-time WebSocket server
- **Frontend Dev Server** (Port 5173) - Vite development server

**Expected Output:**
```
[server] Elysia is running at localhost:3000
[server] Socket.IO real-time seat booking enabled on port 3001
[dev] VITE v7.1.7  ready in 500 ms
[dev] ➜  Local:   http://localhost:5173/
```

### Option 2: Run Separately (For Debugging)

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

---

## Accessing the Application

Once the servers are running, open your browser and navigate to:

```
http://localhost:5173
```

### Available Ports
- **Frontend:** http://localhost:5173 (Vite)
- **Backend API:** http://localhost:3000 (Elysia)
- **Socket.IO:** http://localhost:3001 (WebSocket)

---

## Demo Accounts

### Admin Account
```
Username: Manager
Password: admin123
```
**Permissions:** Can manage all movies, view analytics, access admin features

### Regular User Account
```
Username: test
Password: test123
```
**Permissions:** Can book tickets, manage own profile

> **Or** register a new account or use **Google Sign-In**

---

## Testing the Real-Time Feature

To test the real-time seat booking:

1. **Open the application** in your browser
2. **Navigate to:** Movies → Select a movie → Choose showtime → Seat Selection
3. **Open a second browser window** (or Incognito mode)
4. **Go to the same showtime** in both windows
5. **Select a seat in Window 1** - Watch it turn orange (locked) in Window 2
6. **Try clicking the locked seat in Window 2** - You'll see "Seat is locked by another user"
7. **Deselect in Window 1** - Watch it become available in Window 2 instantly

**Look for the Live badge** to confirm real-time connection is active.

---

## Building for Production

```bash
# Build optimized frontend
npm run build

# Preview production build
npm run preview
```

The production files will be in the `dist/` directory.

---

## Project Structure

```
CinemaHub/
├── public/                  # Static assets and JSON data
│   ├── cinemas-data.json   # Cinema locations
│   ├── movies-data.json    # Movie catalog
│   ├── showtimes-data.json # Screening schedules
│   ├── users-data.json     # User accounts
│   └── images/             # Static images
│
├── server/                  # Backend (Bun + Elysia + Socket.IO)
│   ├── index.ts            # Server entry point
│   ├── db.json             # Refresh tokens storage
│   ├── lib/                # Database operations
│   └── modules/            # Feature modules
│       ├── auth/           # Authentication logic
│       └── seats/          # Real-time seat management
│
├── src/                     # Frontend (Vue.js 3)
│   ├── main.js             # App entry point
│   ├── App.vue             # Root component
│   ├── components/         # Reusable components
│   ├── composables/        # Vue composables (real-time logic)
│   ├── router/             # Vue Router config
│   ├── services/           # API services
│   └── views/              # Page components
│       ├── Home.vue
│       ├── Movies.vue
│       ├── SeatSelection.vue
│       └── ...
│
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── tsconfig.json           # TypeScript config
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server (Vite) |
| `npm run server` | Start backend server (Bun + Elysia + Socket.IO) |
| `npm run app` | Start both frontend and backend concurrently |
| `npm run build` | Build production-ready frontend |
| `npm run preview` | Preview production build |

---

## Troubleshooting

### Issue: "Bun command not found"
**Solution:** Install Bun using the command in Prerequisites section

### Issue: "Port 3000/3001/5173 already in use"
**Solution:** 
```bash
# Windows - Kill processes on ports
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change ports in vite.config.js and server/index.ts
```

### Issue: "Cannot connect to Socket.IO server"
**Solution:** 
- Ensure backend server is running (`npm run server`)
- Check browser console for connection errors
- Verify CORS settings in `server/index.ts`

### Issue: "Google login not working"
**Solution:** 
- Google OAuth requires proper client ID configuration
- For local development, local login works fine
- See `.env` file configuration above

---

## Documentation

- **Project Report:** `PROJECT_REPORT.md` - Comprehensive project documentation
- **Video Script:** `VIDEO_SCRIPT.md` - Tutorial script for Stage 3 feature
- **Implementation Guide:** `IMPLEMENTATION_SUMMARY.md` - Real-time feature details
- **Feature Guide:** `REALTIME_FEATURE_GUIDE.md` - Testing scenarios

---

## Learning Outcomes

This project demonstrates:
- Modern Vue.js 3 development with Composition API
- Real-time WebSocket communication with Socket.IO
- JWT-based authentication with OAuth integration
- RESTful API design with TypeScript
- Responsive web design principles
- State management and event-driven architecture
- Production-ready code patterns

---

## License

This project is created for educational purposes as part of COS30043 - Interface Design and Development at Swinburne University of Technology.

---

## Author

**Course:** COS30043 - Interface Design and Development  
**Institution:** Swinburne University of Technology  
**Year:** 2025  
**Repository:** [github.com/qnam-11/COS30043-CinemaHub](https://github.com/qnam-11/COS30043-CinemaHub)

---

##  Acknowledgments

- UI/UX inspired by [Stremio](https://www.stremio.com/)
- Movie data structure based on TMDB
- Real-time architecture inspired by production ticketing platforms

---

**Last Updated:** November 24, 2025
