const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const REFRESH_COOKIE_NAME = 'refreshToken';

const getAccessTokenExpiry = () => process.env.JWT_EXPIRE || '15m';

const getRefreshTokenExpiryMs = () => {
  const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 30);

  return refreshDays * 24 * 60 * 60 * 1000;
};

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: getAccessTokenExpiry() }
  );
};

const generateOpaqueToken = () => crypto.randomBytes(48).toString('hex');

const hashToken = (value) => crypto.createHash('sha256').update(value).digest('hex');

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: getRefreshTokenExpiryMs(),
  path: '/api/auth'
});

module.exports = {
  REFRESH_COOKIE_NAME,
  generateAccessToken,
  generateOpaqueToken,
  hashToken,
  getAccessTokenExpiry,
  getRefreshTokenExpiryMs,
  getRefreshTokenCookieOptions
};