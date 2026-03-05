# 🎫 EventFlow: Modern Event Management Platform

[![Angular](https://img.shields.io/badge/Angular-v21-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](LICENSE)

EventFlow is a comprehensive, full-stack event management solution designed for seamless event discovery, ticket booking, and administrative oversight. Built with the **MEAN stack** (MongoDB, Express, Angular 21, Node.js), it features a highly responsive UI with 3D particle effects and a robust RESTful API.

---

## 🚀 Key Features

### 👤 For Users
- **Dynamic Event Discovery**: Browse events with real-time category filtering and search.
- **Interactive UI**: Immersive experience powered by Three.js and tsparticles.
- **Secure Authentication**: JWT-based login and registration with encrypted passwords (bcryptjs).
- **Seamless Booking**: Real-time ticket availability tracking and instant booking.
- **User Profile**: Personal dashboard to manage bookings and cancel tickets.
- **Contact Support**: Integrated contact form for user inquiries.

### 🛡️ For Administrators
- **Executive Dashboard**: High-level overview of platform statistics (total users, events, and bookings).
- **Event Management**: Full CRUD capabilities for managing event details, pricing, and schedules.
- **User Oversight**: Monitor and manage registered users and their activity.
- **Booking Management**: Comprehensive view of all platform-wide transactions.

---

## 🛠️ Technical Stack

**Frontend:**
- **Framework**: Angular 21 (Signals, Standalone Components)
- **Styling**: Angular Material, SCSS, Vanilla CSS
- **Visuals**: Three.js (3D backgrounds), tsparticles
- **State Management**: RxJS

**Backend:**
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Security**: JSON Web Tokens (JWT), bcryptjs
- **Mail**: Nodemailer for system notifications

---

## 📂 Project Structure

```text
event-management-app/
├── backend/                # Express API & Server
│   ├── scripts/            # Database seeding & utility scripts
│   ├── src/
│   │   ├── config/         # DB & Environment configurations
│   │   ├── controllers/    # Request handlers (logic)
│   │   ├── middleware/     # Auth & Error handling
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Endpoints
│   │   └── utils/          # Helper functions
│   └── server.js           # Main entry point
├── frontend/               # Angular 21 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── guards/     # Auth & Admin route protection
│   │   │   ├── services/   # API & Auth logic
│   │   │   └── models/     # Type definitions
│   │   └── assets/         # Static assets & 3rd party libs
│   └── angular.json
└── vercel.json             # Deployment configuration
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v20 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas)
- **NPM** (v10 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/event-management-app.git
cd event-management-app
```

### 2. Backend Configuration
Navigate to the backend directory and set up your environment variables:
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_ultra_secure_secret
PORT=5000
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
```

### 3. Database Seeding (Optional)
Populate your database with sample events, users, and an admin account:
```bash
npm run seed
```

### 4. Frontend Configuration
Open a new terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
```

### 5. Running the Application
**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm start
```
The application will be available at `http://localhost:4200`.

---

## 🚢 Deployment

The project is pre-configured for deployment on **Vercel**. 

1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add the environment variables from your `.env` file to the Vercel project settings.
4. Vercel will automatically detect the `vercel.json` and deploy both the backend and the built frontend.

---

## 🔒 Security
- **JWT-Only Routes**: Sensitive API endpoints are protected via custom `authMiddleware`.
- **Password Hashing**: All user passwords are salted and hashed using `bcryptjs`.
- **Role-Based Access Control (RBAC)**: Distinct guards for user and admin namespaces.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the **ISC License**.

---
*Created with ❤️ by [Vedant Joshi](https://github.com/vedant-joshi)*
