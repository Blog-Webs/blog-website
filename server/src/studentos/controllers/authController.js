const GoogleApiService = require('../services/GoogleApiService');
const StudentOSToken = require('../models/StudentOSToken');
const CryptoService = require('../services/CryptoService');
const { google } = require('googleapis');

const studentOSAuthController = {
  // GET /api/studentos/auth/url  — returns the Google OAuth consent URL
  getAuthUrl(req, res) {
    const url = GoogleApiService.getAuthUrl();
    res.json({ url });
  },

  // GET /api/studentos/auth/callback  — OAuth2 callback from Google
  async handleCallback(req, res) {
    try {
      const { code, error } = req.query;
      if (error) {
        return res.redirect(
          `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-os?error=access_denied`
        );
      }
      if (!code) {
        return res.redirect(
          `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-os?error=no_code`
        );
      }

      // Exchange code for tokens
      const tokens = await GoogleApiService.exchangeCode(code);

      // Get the Google email for this token
      const authClient = GoogleApiService.createOAuthClient();
      authClient.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
      const { data: profile } = await oauth2.userinfo.get();

      // We need req.user to attach the token to — but the callback comes
      // from Google, not from our authenticated frontend. Pass userId via state param.
      // The frontend should encode userId in the 'state' param before redirecting.
      // For simplicity, we find the user by the Google email (they must be logged in).
      const { User } = require('../../../models');
      const user = await User.findOne({ email: profile.email });

      if (!user) {
        return res.redirect(
          `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-os?error=user_not_found`
        );
      }

      // Save/update encrypted tokens
      await StudentOSToken.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          accessToken: CryptoService.encrypt(tokens.access_token),
          refreshToken: CryptoService.encrypt(tokens.refresh_token || ''),
          expiresAt: tokens.expiry_date || Date.now() + 3600 * 1000,
          scope: tokens.scope || '',
          googleEmail: profile.email,
          isActive: true,
        },
        { upsert: true, new: true }
      );

      // Redirect to StudentOS with success
      res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-os?connected=true`
      );
    } catch (err) {
      console.error('[StudentOS OAuth callback]', err.message);
      res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-os?error=oauth_failed`
      );
    }
  },

  // GET /api/studentos/auth/status — check if user has connected Google Workspace
  async getStatus(req, res) {
    const token = await StudentOSToken.findOne({ user: req.user._id, isActive: true })
      .select('googleEmail scope createdAt updatedAt');
    res.json({
      connected: !!token,
      googleEmail: token?.googleEmail || null,
      connectedAt: token?.createdAt || null,
    });
  },

  // DELETE /api/studentos/auth/disconnect — revoke and remove tokens
  async disconnect(req, res) {
    try {
      const tokenDoc = await StudentOSToken.findOne({ user: req.user._id });
      if (tokenDoc) {
        // Try to revoke with Google
        try {
          const authClient = GoogleApiService.createOAuthClient();
          authClient.setCredentials({
            access_token: CryptoService.decrypt(tokenDoc.accessToken),
          });
          await authClient.revokeToken(CryptoService.decrypt(tokenDoc.accessToken));
        } catch {}
        tokenDoc.isActive = false;
        await tokenDoc.save();
      }
      res.json({ success: true, message: 'Google Workspace disconnected.' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to disconnect.' });
    }
  },
};

module.exports = studentOSAuthController;
