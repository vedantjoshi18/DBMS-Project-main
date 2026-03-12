# EventHub College Platform

Full-stack college event management platform built with Angular 21, Express 5, and MongoDB.

The application supports public event discovery, club/department organizer pages, secure email-verified authentication, booking workflows, and an admin control panel for events, users, and organizer groups.

## What Is Implemented

### Student-facing
- Home, explore, clubs, departments, and event detail pages
- Category and organizer-based event browsing
- Booking flow and booking history
- Profile page
- Contact form

### Organizer model
- Dedicated organizer groups with two types: club and department
- Public routes for organizer listing, organizer detail, and organizer event feeds
- Event documents linked to organizer groups

### Admin-facing
- Dashboard stats (users, events, bookings, revenue, clubs, departments)
- Event CRUD
- User listing and deletion
- Organizer group CRUD

### Security and auth
- Email verification required for new registrations
- JWT access tokens with refresh token rotation
- Refresh token stored in secure HTTP-only cookie
- Rate limiting on login and registration routes
- Helmet security headers
- Role-based access control for admin APIs

## Tech Stack

### Frontend
- Angular 21 (standalone components + lazy routes)
- Angular Material
- RxJS
- Three.js and tsparticles (existing visual dependencies)

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT + bcryptjs
- Nodemailer
- cookie-parser, helmet, express-rate-limit, cors

## Repository Structure

```text
event-management-app/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   ├── pipes/
│   │   │   └── services/
│   │   └── environments/
│   └── angular.json
└── vercel.json
```

## Local Setup

### Prerequisites
- Node.js 20+ recommended
- npm
- MongoDB Atlas or local MongoDB

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend environment

Create backend/.env with:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:4200

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE_DAYS=30

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_VERIFICATION_URL=http://localhost:5000/api/auth/verify-email?token=
```

### 3. Start backend and frontend

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm start
```

Frontend: http://localhost:4200

Backend health check: http://localhost:5000/api/health

## Database Seed and Content Refresh

### Seed baseline data

```bash
cd backend
npm run seed
```

This creates:
- Users (including one admin)
- Organizer groups (clubs + departments)
- College-themed events
- Sample bookings

### Refresh event content for existing DB records

```bash
cd backend
node scripts/refreshEventContent.js
```

Use this if events already exist and you want to update titles/descriptions/images content pack logic to the latest set.

## Main API Routes

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/verify-email
- GET /api/auth/me

### Events
- GET /api/events
- GET /api/events/:id
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

### Organizer Groups
- GET /api/organizer-groups
- GET /api/organizer-groups/:slug
- GET /api/organizer-groups/:slug/events
- POST /api/organizer-groups (admin)
- PUT /api/organizer-groups/:id (admin)
- DELETE /api/organizer-groups/:id (admin)

### Bookings
- POST /api/bookings
- GET /api/bookings/my-bookings
- GET /api/bookings/:id
- PUT /api/bookings/:id/cancel
- GET /api/bookings/admin/all (admin)

### Admin
- GET /api/admin/stats
- GET /api/admin/group-stats
- GET /api/admin/users
- DELETE /api/admin/users/:id
- POST /api/admin/groups
- PUT /api/admin/groups/:id
- DELETE /api/admin/groups/:id

### Contact
- POST /api/contact

## Frontend Route Map

- /
- /explore
- /clubs
- /clubs/:slug
- /departments
- /departments/:slug
- /events
- /event/:id
- /book/:id
- /profile
- /admin
- /login

## Build Commands

```bash
cd frontend
npm run build
```

```bash
cd backend
npm start
```

## Notes

- Backend CORS origin is controlled by FRONTEND_URL.
- Refresh token cookie is scoped to /api/auth.
- Admin routes require both authenticated user and admin role.

## License

ISC
