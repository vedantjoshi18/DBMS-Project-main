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
      enum: [
        'Technical',
        'Cultural',
        'Sports',
        'Academic',
        'Workshop',
        'Seminar',
        'Competition',
        'Social',
        'Other'
      ]
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
    organizerGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizerGroup',
      required: false
    },
    organizerGroupType: {
      type: String,
      enum: ['club', 'department'],
      required: false
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
    registrationLink: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(value) {
          if (!value) {
            return true;
          }

          return /^https:\/\/(docs\.google\.com\/forms|forms\.gle)\//i.test(value);
        },
        message: 'Registration link must be a valid Google Form URL'
      }
    },
    image: {
      type: String,
      default: 'default-event.jpg'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isHot: {
      type: Boolean,
      default: false
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
eventSchema.index({ organizerGroup: 1, date: -1 });
eventSchema.index({ isHot: 1, date: -1 });
eventSchema.index({ isFeatured: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);