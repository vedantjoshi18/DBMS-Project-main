const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    numberOfTickets: {
      type: Number,
      required: [true, 'Please specify number of tickets'],
      min: [1, 'Must book at least 1 ticket'],
      default: 1
    },
    totalAmount: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'pending'
    },
    bookingReference: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

// ✅ Generate unique booking reference before saving - Modern approach
bookingSchema.pre('save', async function () {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).slice(2, 11).toUpperCase();
  }
});

// Prevent duplicate bookings
bookingSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);