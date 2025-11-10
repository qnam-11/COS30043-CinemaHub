# CinemaHub - Movie Streaming Platform

CinemaHub is a modern, responsive movie streaming web application built with Vue.js 3, Bootstrap 5, and Vite. This project demonstrates a full-featured web application with user authentication, content management, and social features.

## 🎬 Project Overview

CinemaHub provides users with a platform to browse, search, and manage movies. The application features user authentication, movie CRUD operations, search and filtering capabilities, and social features like liking movies.

## ✨ Features

### Stage 1 Requirements ✅
- ✅ Built with Vite and Vue 3
- ✅ Vue Router implementation
- ✅ Three main pages: Home, News, and About
- ✅ **Home Page**: Hero section, feature cards, and showcase images
- ✅ **News Page**: 
  - News items loaded from JSON file
  - Search by date, title, content, and category
  - Pagination (6 items per page)
- ✅ **About Page**:
  - About section with company information
  - Personalized welcome message (first name + last name input)
  - Image selection based on user choice (Mountain/Ocean)
- ✅ Responsive design for mobile, tablet, and desktop (Bootstrap grid system)

### Stage 2 Requirements ✅
- ✅ **Authentication System**:
  - User registration with validation
  - User login/logout
  - Differentiated content for authenticated/unauthenticated users
  - Demo credentials provided
  
- ✅ **Movie Management**:
  - Browse movies with pagination
  - Search movies by title, director, or description
  - Filter by genre, year, and minimum rating
  - Sort by rating, year, likes, or title
  - Authenticated users can add new movies
  - Users can edit/delete their own movies
  - Admin can edit/delete any movie
  
- ✅ **Social Features**:
  - Like/unlike movies (authenticated users only)
  - Like count display
  - User-specific like tracking
  
- ✅ **Data Persistence**:
  - LocalStorage for user data and custom movies
  - JSON files for initial data
  
- ✅ **Accessibility**:
  - ARIA labels and roles
  - Keyboard navigation support
  - Form validation with error messages
  - Semantic HTML structure

## 🛠️ Technologies Used

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **Vue Router 4** - Official router for Vue.js
- **Bootstrap 5** - CSS framework for responsive design
- **LocalStorage** - Client-side data persistence
- **JSON** - Data storage format

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CinemaHub
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 👤 Demo Accounts

### Admin Account
- Username: `admin`
- Password: `admin123`
- Permissions: Can edit/delete any movie

### Regular User Account
- Username: `john_doe`
- Password: `password123`
- Permissions: Can add movies, edit/delete own movies

## 📱 Responsive Design

The application is fully responsive and tested on:
- **Desktop** (1200px and above)
- **Tablet** (768px - 1199px)
- **Mobile** (below 768px)

## 🎨 Design Inspiration

The UI design is inspired by [Stremio](https://www.stremio.com/), featuring:
- Dark theme with purple and green accent colors
- Modern card-based layouts
- Smooth animations and transitions
- Intuitive navigation

## 🔐 Security Notes

⚠️ **Important**: This is a demonstration project. In a production environment:
- Passwords should be hashed (bcrypt, argon2)
- Use a backend API instead of localStorage
- Implement proper session management
- Add CSRF protection
- Use HTTPS for all communications

## 🎓 Learning Outcomes

This project demonstrates:
- Modern Vue.js 3 development practices
- Responsive web design principles
- User authentication implementation
- CRUD operations
- State management
- Form validation
- Accessibility best practices

---

**Course**: COS30043 - Interface Design and Development  
**Institution**: Swinburne University of Technology  
**Last Updated**: November 2025
