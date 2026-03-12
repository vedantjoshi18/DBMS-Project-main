const rateLimit = require('express-rate-limit');

const buildLimiter = (message, max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message
  }
});

const loginLimiter = buildLimiter(
  'Too many login attempts. Please try again in 15 minutes.',
  10
);

const registerLimiter = buildLimiter(
  'Too many registration attempts. Please try again in 15 minutes.',
  5
);

module.exports = {
  loginLimiter,
  registerLimiter
};