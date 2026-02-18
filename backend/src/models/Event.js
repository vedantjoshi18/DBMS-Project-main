const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide event category'],
      enum: ['Conference', 'Workshop', 'Seminar', 'Meetup', 'Concert', 'Sports', 'Other']
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date'],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'Event date must be in the future'
      }
    },
    time: {
      type: String,
      required: [true, 'Please provide event time']
    },
    location: {
      venue: {
        type: String,
        required: [true, 'Please provide venue name']
      },
      address: {
        type: String,
        required: [true, 'Please provide venue address']
      },
      city: {
        type: String,
        required: [true, 'Please provide city']
      }
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    maxAttendees: {
      type: Number,
      required: [true, 'Please specify maximum attendees'],
      min: [1, 'Must allow at least 1 attendee']
    },
    currentAttendees: {
      type: Number,
      default: 0
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      default: 'default-event.jpg'
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);