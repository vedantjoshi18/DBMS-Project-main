const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateEvent } = require('../middleware/validateRequest');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, validateEvent, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;