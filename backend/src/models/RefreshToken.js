const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    familyId: {
      type: String,
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: Date,
    revokedReason: String,
    replacedByToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RefreshToken'
    },
    createdByIp: String,
    userAgent: String,
    lastUsedAt: Date
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);