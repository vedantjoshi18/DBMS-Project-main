const mongoose = require('mongoose');

const organizerGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide organizer group name'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Please provide organizer group slug'],
      unique: true,
      lowercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['club', 'department'],
      required: [true, 'Please provide organizer group type']
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

organizerGroupSchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('OrganizerGroup', organizerGroupSchema);
