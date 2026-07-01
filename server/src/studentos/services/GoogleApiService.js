const { google } = require('googleapis');
const StudentOSToken = require('../models/StudentOSToken');
const CryptoService = require('./CryptoService');

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * Creates and returns an authenticated Google OAuth2 client for a user.
 * Automatically refreshes expired access tokens and persists the new token.
 */
const GoogleApiService = {
  SCOPES,

  createOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_STUDENTOS_REDIRECT_URI || 'http://localhost:5000/api/studentos/auth/callback'
    );
  },

  getAuthUrl() {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent to ensure we get a refresh token
      include_granted_scopes: true,
    });
  },

  async exchangeCode(code) {
    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);
    return tokens;
  },

  /**
   * Returns an authenticated googleapis OAuth2 client for a user.
   * If the access token is expired, it will auto-refresh and save the new token.
   */
  async getAuthenticatedClient(userId) {
    const tokenDoc = await StudentOSToken.findOne({ user: userId, isActive: true });
    if (!tokenDoc) {
      const err = new Error('StudentOS not connected. Please connect Google Workspace first.');
      err.status = 401;
      err.code = 'STUDENTOS_NOT_CONNECTED';
      throw err;
    }

    const client = this.createOAuthClient();
    const decryptedAccess = CryptoService.decrypt(tokenDoc.accessToken);
    const decryptedRefresh = CryptoService.decrypt(tokenDoc.refreshToken);

    client.setCredentials({
      access_token: decryptedAccess,
      refresh_token: decryptedRefresh,
      expiry_date: tokenDoc.expiresAt,
    });

    // Auto-refresh if token is expired or expires in < 5 minutes
    const isExpiredSoon = tokenDoc.expiresAt - Date.now() < 5 * 60 * 1000;
    if (isExpiredSoon) {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      // Persist refreshed token
      tokenDoc.accessToken = CryptoService.encrypt(credentials.access_token);
      tokenDoc.expiresAt = credentials.expiry_date || Date.now() + 3600 * 1000;
      if (credentials.refresh_token) {
        tokenDoc.refreshToken = CryptoService.encrypt(credentials.refresh_token);
      }
      await tokenDoc.save();
    }

    return client;
  },
};

module.exports = GoogleApiService;
