const express = require('express');
const router = express.Router();
const {
	register,
	login,
	forgotPassword,
	getMe,
	refreshAccessToken,
	resetPassword,
	logout,
	verifyEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validateRequest');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/authRateLimit');

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);

router.get('/me', protect, getMe);

module.exports = router;