const express = require('express');
const router = express.Router();
const {
	getStats,
	getAllUsers,
	deleteUser,
	getGroupStats,
	createGroup,
	updateGroup,
	deleteGroup
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/group-stats', getGroupStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);

module.exports = router;
