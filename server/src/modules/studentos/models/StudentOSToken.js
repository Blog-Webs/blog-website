const mongoose = require('mongoose');

/**
 * Stores encrypted Google OAuth tokens for StudentOS per user.
 * access_token and refresh_token are AES-256 encrypted before save.
 */
const studentOSTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Encrypted values (CryptoService handles en/decryption)
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    // Expiry in ms (Unix timestamp) — for knowing when to refresh
    expiresAt: { type: Number, required: true },
    // Scopes granted during OAuth
    scope: { type: String, default: '' },
    // Email of the Google account that was connected
    googleEmail: { type: String, default: '' },
    // Whether this token is currently valid (set false on revoke)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentOSToken', studentOSTokenSchema);
