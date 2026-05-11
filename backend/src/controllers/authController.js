const crypto = require('node:crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendEmail } = require('../utils/email');
const {
  REFRESH_COOKIE_NAME,
  generateAccessToken,
  generateOpaqueToken,
  hashToken,
  getRefreshTokenExpiryMs,
  getRefreshTokenCookieOptions
} = require('../utils/generateToken');

const buildAuthPayload = (user, accessToken) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  emailVerified: user.emailVerified,
  token: accessToken
});

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshTokenCookieOptions());
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());
};

const buildVerificationUrl = (req, verificationToken) => {
  if (process.env.EMAIL_VERIFICATION_URL) {
    return `${process.env.EMAIL_VERIFICATION_URL}${verificationToken}`;
  }

  return `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
};

const buildPasswordResetUrl = (req, resetToken) => {
  if (process.env.PASSWORD_RESET_URL) {
    return `${process.env.PASSWORD_RESET_URL}${resetToken}`;
  }

  const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
  return `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;
};

const sendVerificationEmail = async (user, req, verificationToken) => {
  const verificationUrl = buildVerificationUrl(req, verificationToken);

  await sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify your EventHub account',
    text: `Hi ${user.name},\n\nPlease verify your email by opening this link: ${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <h2>Verify your EventHub account</h2>
      <p>Hi ${user.name},</p>
      <p>Please confirm your email address to activate your account.</p>
      <p><a href="${verificationUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
    `
  });
};

const sendPasswordResetEmail = async (user, req, resetToken) => {
  const resetUrl = buildPasswordResetUrl(req, resetToken);

  await sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Reset your EventHub password',
    text: `Hi ${user.name},\n\nWe received a request to reset your EventHub password. Open this link to choose a new password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
    html: `
      <h2>Reset your password</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your EventHub password.</p>
      <p><a href="${resetUrl}">Choose a new password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `
  });
};

const createStoredRefreshToken = async (user, req, familyId = crypto.randomUUID()) => {
  const refreshToken = generateOpaqueToken();
  const refreshTokenDoc = await RefreshToken.create({
    user: user._id,
    familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + getRefreshTokenExpiryMs()),
    createdByIp: req.ip,
    userAgent: req.get('user-agent')
  });

  return {
    refreshToken,
    refreshTokenDoc
  };
};

const revokeRefreshTokenFamily = async (familyId, reason) => {
  await RefreshToken.updateMany(
    {
      familyId,
      revokedAt: { $exists: false }
    },
    {
      $set: {
        revokedAt: new Date(),
        revokedReason: reason
      }
    }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      emailVerified: false
    });

    const verificationToken = generateOpaqueToken();
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user, req, verificationToken);
    } catch (emailError) {
      await user.deleteOne();
      throw emailError;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email before logging in.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified
      },
      verificationRequired: true
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Include verification fields so legacy accounts can be upgraded safely.
    const user = await User.findOne({ email }).select(
      '+password +emailVerificationToken +emailVerificationExpires'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isLegacyUser =
      typeof user.emailVerified !== 'boolean' &&
      !user.emailVerificationToken &&
      !user.emailVerificationExpires;

    if (isLegacyUser) {
      user.emailVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { refreshToken } = await createStoredRefreshToken(user, req);
    const accessToken = generateAccessToken(user._id);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: buildAuthPayload(user, accessToken)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (user) {
      const resetToken = generateOpaqueToken();
      user.passwordResetToken = hashToken(resetToken);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      try {
        await sendPasswordResetEmail(user, req, resetToken);
      } catch (emailError) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw emailError;
      }
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
      error: error.message
    });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await RefreshToken.updateMany(
      { user: user._id, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date(), revokedReason: 'password reset' } }
    );

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired'
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification',
      error: error.message
    });
  }
};

// @desc    Rotate refresh token and issue a new access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is missing'
      });
    }

    const currentToken = await RefreshToken.findOne({
      tokenHash: hashToken(incomingRefreshToken)
    }).populate('user');

    if (!currentToken) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid'
      });
    }

    if (currentToken.revokedAt || currentToken.expiresAt <= new Date()) {
      await revokeRefreshTokenFamily(currentToken.familyId, 'refresh token reuse detected');
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token is no longer valid'
      });
    }

    if (!currentToken.user?.emailVerified) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User is not authorized'
      });
    }

    const { refreshToken, refreshTokenDoc } = await createStoredRefreshToken(
      currentToken.user,
      req,
      currentToken.familyId
    );

    currentToken.revokedAt = new Date();
    currentToken.revokedReason = 'rotated';
    currentToken.replacedByToken = refreshTokenDoc._id;
    currentToken.lastUsedAt = new Date();
    await currentToken.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: buildAuthPayload(currentToken.user, generateAccessToken(currentToken.user._id))
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    clearRefreshTokenCookie(res);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
      error: error.message
    });
  }
};

// @desc    Logout user and revoke current refresh token
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (incomingRefreshToken) {
      await RefreshToken.findOneAndUpdate(
        { tokenHash: hashToken(incomingRefreshToken) },
        {
          revokedAt: new Date(),
          revokedReason: 'logout'
        }
      );
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    clearRefreshTokenCookie(res);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};