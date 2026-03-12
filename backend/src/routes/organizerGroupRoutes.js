const express = require('express');
const router = express.Router();
const {
  getAllGroups,
  getGroupBySlug,
  getEventsByGroup,
  createGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/organizerGroupController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllGroups);
router.get('/:slug', getGroupBySlug);
router.get('/:slug/events', getEventsByGroup);

router.post('/', protect, adminOnly, createGroup);
router.put('/:id', protect, adminOnly, updateGroup);
router.delete('/:id', protect, adminOnly, deleteGroup);

module.exports = router;
