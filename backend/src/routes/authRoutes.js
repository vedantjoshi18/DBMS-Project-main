const express = require('express');
const router = express.Router();
const {
	register,
	login,
	getMe,
	refreshAccessToken,
	logout,
	verifyEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validateRequest');
const { loginLimiter, registerLimiter } = require('../middleware/authRateLimit');

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);

router.get('/me', protect, getMe);

module.exports = router;