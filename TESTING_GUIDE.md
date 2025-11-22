# CinemaHub Testing Guide

## 🧪 Complete Testing Checklist

This guide provides step-by-step instructions for testing all features of the CinemaHub application.

---

## 🚀 Getting Started

### Prerequisites
1. Node.js installed
2. npm or yarn package manager
3. Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Application
```bash
cd CinemaHub
npm install
npm run dev
```

Access: `http://localhost:5173`

### Demo Accounts
- **Admin**: `admin` / `admin123`
- **User**: `john_doe` / `password123`

---

## 📋 Feature Testing

### 1. User Authentication ✅

#### Test 1.1: Registration
1. Click "Sign Up" in navigation
2. Fill in registration form:
   - First Name: John
   - Last Name: Doe
   - Username: testuser123
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Register"
4. **Expected**: Redirect to login page with success message

#### Test 1.2: Login
1. Navigate to Login page
2. Enter username: `john_doe`
3. Enter password: `password123`
4. Click "Login"
5. **Expected**: Redirect to Movies page, user menu appears in nav

#### Test 1.3: Logout
1. Click user menu in navigation
2. Click "Logout"
3. Confirm logout
4. **Expected**: Redirect to home, "Login" and "Sign Up" appear

---

### 2. Movie Browsing ✅

#### Test 2.1: Browse Movies
1. Navigate to Movies page
2. **Expected**: See grid of 12 movies with posters, titles, ratings

#### Test 2.2: Search Movies
1. On Movies page, enter "Dark" in search box
2. **Expected**: See "The Dark Knight" in results

#### Test 2.3: Filter by Genre
1. Select "Action" from genre dropdown
2. **Expected**: Only action movies displayed

#### Test 2.4: Filter by Rating
1. Select "9.0+" from rating dropdown
2. **Expected**: Only movies with rating ≥ 9.0 shown

#### Test 2.5: Sort Movies
1. Select "Most Liked" from sort dropdown
2. **Expected**: Movies reordered by like count

#### Test 2.6: Pagination
1. Note total page count
2. Click "Next" button
3. **Expected**: Show next 12 movies
4. Click page number
5. **Expected**: Jump to that page

---

### 3. Movie Details ✅

#### Test 3.1: View Movie Details
1. Click on any movie card
2. **Expected**: Navigate to movie detail page with:
   - Large poster
   - Title, year, rating, duration
   - Cast and director
   - Description
   - Synopsis
   - Trailer (embedded video)

#### Test 3.2: Play Trailer
1. On movie detail page
2. Click play on trailer
3. **Expected**: YouTube video plays

#### Test 3.3: Like Movie (Authenticated)
1. Login if not already
2. On movie detail page
3. Click heart/like button
4. **Expected**: 
   - Heart fills with color
   - Like count increases by 1
5. Click again
6. **Expected**:
   - Heart empties
   - Like count decreases by 1

---

### 4. Reviews System ✅

#### Test 4.1: Write Review
1. Login
2. On movie detail page, scroll to reviews
3. Click "Write a Review"
4. Select 5 stars
5. Enter title: "Amazing movie!"
6. Enter content: "Best movie I've ever seen..."
7. Click "Submit Review"
8. **Expected**: Review appears in list

#### Test 4.2: Vote Review as Helpful
1. Find a review
2. Click "👍 Helpful" button
3. **Expected**: Count increases, button highlights

#### Test 4.3: Edit Own Review
1. Find your review
2. Click "Edit"
3. Change rating to 4 stars
4. Modify content
5. Click "Update Review"
6. **Expected**: Review updates with changes

#### Test 4.4: Delete Review
1. Find your review
2. Click "Delete"
3. Confirm deletion
4. **Expected**: Review removed from list

#### Test 4.5: Sort Reviews
1. Use sort dropdown
2. Select "Most Helpful"
3. **Expected**: Reviews reorder by helpful votes

---

### 5. Showtimes & Booking ✅

#### Test 5.1: View Showtimes
1. On movie detail page
2. Scroll to "Showtimes & Tickets" section
3. **Expected**: List of available showtimes with:
   - Cinema name and address
   - Date and time
   - Format (2D/3D/IMAX)
   - Language
   - Available seats
   - Price

#### Test 5.2: Filter Showtimes
1. Select cinema from dropdown
2. **Expected**: Only showtimes for that cinema shown
3. Select date
4. **Expected**: Only showtimes for that date shown
5. Select format "IMAX"
6. **Expected**: Only IMAX showtimes shown

#### Test 5.3: Select Showtime (Guest)
1. Logout if logged in
2. Click "Select Seats" on any showtime
3. **Expected**: Redirect to login page

---

### 6. Seat Selection ✅

#### Test 6.1: Access Seat Selection
1. Login
2. On movie detail page
3. Click "Select Seats" on a showtime
4. **Expected**: Navigate to seat selection page showing:
   - Movie and showtime info
   - Visual seat map
   - Ticket type selector
   - Booking summary

#### Test 6.2: Select Seats
1. Click on available (green) seat
2. **Expected**: Seat turns purple, added to selected list
3. Click same seat again
4. **Expected**: Seat deselected, removed from list
5. Try clicking occupied (gray) seat
6. **Expected**: Nothing happens (unclickable)

#### Test 6.3: Select Ticket Types
1. Select 2 seats (e.g., A1, A2)
2. Click "+" on "Adult" twice
3. **Expected**: Adult count shows 2
4. Try clicking "+" again
5. **Expected**: Disabled (matches seat count)

#### Test 6.4: Ticket Type Validation
1. Select 3 seats
2. Select 1 Adult, 1 Child ticket
3. Click "Proceed to Checkout"
4. **Expected**: Error message "Please select ticket types matching your seats"

#### Test 6.5: Clear Selection
1. Select seats and tickets
2. Click "Clear Selection"
3. **Expected**: All seats and ticket counts reset

#### Test 6.6: Proceed to Checkout
1. Select 2 seats
2. Select 2 Adult tickets
3. Click "Proceed to Checkout"
4. **Expected**: Navigate to checkout page

---

### 7. Checkout & Payment ✅

#### Test 7.1: Review Booking
1. On checkout page
2. **Expected**: See:
   - Movie title
   - Cinema and screen
   - Date and time
   - Selected seats
   - Price breakdown
   - Total amount with booking fee

#### Test 7.2: Payment Method Selection
1. Click "PayPal" option
2. **Expected**: PayPal message appears
3. Click "Credit/Debit Card"
4. **Expected**: Card form appears

#### Test 7.3: Card Validation
1. Leave card number empty
2. Click "Confirm & Pay"
3. **Expected**: Button disabled (validation fails)
4. Enter card: `1234567890123456`
5. Enter expiry: `12/25`
6. Enter CVV: `123`
7. Enter name: `John Doe`
8. **Expected**: Button becomes enabled

#### Test 7.4: Complete Booking
1. Fill in all card details
2. Click "Confirm & Pay"
3. **Expected**:
   - Processing animation appears
   - Success modal shows after 2 seconds
   - Booking code displayed (e.g., CH-ABC12345)
   - Booking details shown

#### Test 7.5: View Booking
1. In success modal
2. Click "View Booking"
3. **Expected**: Navigate to profile page showing booking

---

### 8. User Profile ✅

#### Test 8.1: Access Profile
1. Login
2. Click user menu
3. Click "My Profile"
4. **Expected**: Navigate to profile page showing:
   - User avatar (initials)
   - User name and email
   - Statistics (bookings, likes, reviews, spending)

#### Test 8.2: View Statistics
1. On profile page
2. **Expected**: See 4 stat cards:
   - Total Bookings
   - Liked Movies
   - Reviews Written
   - Total Spent

#### Test 8.3: View Bookings Tab
1. Click "🎟️ Bookings" tab
2. **Expected**: List of user's bookings with:
   - Movie title
   - Status badge (CONFIRMED/CANCELLED)
   - Booking code
   - Cinema, date, time
   - Seats
   - Total price
   - Action buttons

#### Test 8.4: Filter Bookings
1. Select "Upcoming" from filter dropdown
2. **Expected**: Only future bookings shown
3. Select "Past"
4. **Expected**: Only past bookings shown

#### Test 8.5: View E-Ticket
1. Find a confirmed booking
2. Click "🎟️ View Ticket"
3. **Expected**: Modal opens showing:
   - Booking code
   - Movie and showtime details
   - Seats
   - QR code
   - Download button

#### Test 8.6: Cancel Booking
1. Find upcoming booking (>24 hours away)
2. Click "Cancel" button
3. Confirm cancellation
4. **Expected**: Booking status changes to CANCELLED

#### Test 8.7: View Liked Movies Tab
1. Click "❤️ Liked Movies" tab
2. **Expected**: Grid of movies user has liked
3. Click on a movie
4. **Expected**: Navigate to movie detail page

#### Test 8.8: View Reviews Tab
1. Click "⭐ Reviews" tab
2. **Expected**: List of user's reviews with:
   - Movie title (clickable)
   - Rating stars
   - Review title and content
   - Helpful count
   - Edit and Delete buttons

---

### 9. Responsive Design ✅

#### Test 9.1: Mobile View (< 768px)
1. Resize browser to mobile width
2. **Expected**:
   - Navigation collapses to hamburger menu
   - Movie grid shows 1 column
   - Seat map scales down appropriately
   - All forms stack vertically
   - Touch-friendly button sizes

#### Test 9.2: Tablet View (768px - 1199px)
1. Resize browser to tablet width
2. **Expected**:
   - Movie grid shows 2-3 columns
   - Navigation partially collapsed
   - Seat map readable
   - Good spacing and layout

#### Test 9.3: Desktop View (≥ 1200px)
1. Resize browser to desktop width
2. **Expected**:
   - Movie grid shows 4 columns
   - Full navigation visible
   - Optimal spacing
   - Sticky sidebars work

---

### 10. Accessibility ✅

#### Test 10.1: Keyboard Navigation
1. Use Tab key to navigate
2. **Expected**: Focus visible on all interactive elements
3. Press Enter on focused button
4. **Expected**: Button action triggers

#### Test 10.2: Screen Reader (Optional)
1. Enable screen reader (NVDA/JAWS)
2. Navigate through pages
3. **Expected**: All elements announced properly with ARIA labels

#### Test 10.3: Form Labels
1. Inspect any form
2. **Expected**: All inputs have associated labels
3. Click label
4. **Expected**: Input receives focus

---

## 🐛 Bug Testing

### Test Error Handling

#### Test: Invalid Login
1. Enter wrong username/password
2. **Expected**: Error message displays

#### Test: Form Validation
1. Try submitting empty registration form
2. **Expected**: Validation errors show

#### Test: Network Simulation (Optional)
1. Open DevTools
2. Throttle network
3. **Expected**: Loading states display

---

## 📊 Performance Testing

#### Test: Page Load Speed
1. Open DevTools → Performance tab
2. Refresh page
3. **Expected**: Load time < 2 seconds

#### Test: Image Loading
1. Navigate to movies page
2. **Expected**: Images load progressively

---

## 🔄 State Persistence Testing

#### Test: Login Persistence
1. Login
2. Refresh browser
3. **Expected**: Still logged in

#### Test: Cart Persistence
1. Add items to cart
2. Refresh browser
3. **Expected**: Cart items still there

#### Test: Booking History
1. Complete a booking
2. Logout
3. Login again
4. Navigate to profile
5. **Expected**: Booking still in history

---

## ✅ Final Checklist

### Core Functionality
- [ ] User registration works
- [ ] Login/logout works
- [ ] Browse movies works
- [ ] Search and filters work
- [ ] Pagination works
- [ ] Movie details page loads
- [ ] Trailer plays
- [ ] Reviews can be written
- [ ] Likes work
- [ ] Seat selection works
- [ ] Checkout completes
- [ ] Bookings saved
- [ ] Profile displays correctly
- [ ] E-tickets generated

### User Experience
- [ ] Navigation smooth
- [ ] Buttons responsive
- [ ] Forms validate properly
- [ ] Error messages clear
- [ ] Success feedback shown
- [ ] Loading states visible

### Responsive Design
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Desktop view works
- [ ] No horizontal scroll
- [ ] Touch targets adequate

### Data Integrity
- [ ] Bookings persist
- [ ] Reviews persist
- [ ] Likes persist
- [ ] User session maintained
- [ ] No data loss on refresh

---

## 🎯 Test Results Template

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | ✅/❌ | |
| Login | ✅/❌ | |
| Movie Browsing | ✅/❌ | |
| Search/Filter | ✅/❌ | |
| Movie Details | ✅/❌ | |
| Reviews | ✅/❌ | |
| Seat Selection | ✅/❌ | |
| Checkout | ✅/❌ | |
| Profile | ✅/❌ | |
| Responsive | ✅/❌ | |

---

## 📝 Reporting Issues

If you find any bugs, please document:
1. **Feature**: Which feature is affected
2. **Steps**: How to reproduce
3. **Expected**: What should happen
4. **Actual**: What actually happens
5. **Browser**: Which browser/version
6. **Device**: Desktop/Mobile/Tablet
7. **Screenshots**: If applicable

---

## 🎉 Testing Complete!

Once all tests pass, the application is ready for:
- ✅ Demonstration
- ✅ Submission
- ✅ Deployment
- ✅ Production use (with server-side backend)

---

**Last Updated**: November 22, 2025
**Version**: 2.0.0
**Tested By**: _____________
**Date Tested**: _____________
