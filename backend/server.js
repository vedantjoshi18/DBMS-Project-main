// Load environment variables FIRST
require('dotenv').config();

// Import modules
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES FIRST - BEFORE 404 HANDLER

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Main routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/contact', require('./src/routes/contactRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// ✅ 404 HANDLER - AFTER ALL ROUTES
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ✅ ERROR HANDLER - LAST
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

// Only listen if run directly (local dev)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;