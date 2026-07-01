const GoogleApiService = require('../services/GoogleApiService');
const StudentOSToken = require('../models/StudentOSToken');
const CryptoService = require('../services/CryptoService');
const { google } = require('googleapis');
// Resolve User model correctly — direct default export (not destructured)
const User = require('../../../models/User');

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('[StudentOS] ⚠️  GOOGLE_CLIENT_SECRET is not set. OAuth token exchange will fail.');
}

const studentOSAuthController = {
  // GET /api/studentos/auth/url  — returns the Google OAuth consent URL
  getAuthUrl(req, res) {
    const url = GoogleApiService.getAuthUrl();
    res.json({ url });
  },

  // GET /api/studentos/auth/callback  — OAuth2 callback from Google
  async handleCallback(req, res) {
    const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
      const { code, error } = req.query;

      if (error) {
        console.error('[StudentOS callback] Google returned error:', error);
        return res.redirect(`${CLIENT}/student-os?error=access_denied`);
      }
      if (!code) {
        console.error('[StudentOS callback] No code in query params');
        return res.redirect(`${CLIENT}/student-os?error=no_code`);
      }

      // Exchange code for tokens
      console.log('[StudentOS callback] Exchanging code for tokens...');
      const tokens = await GoogleApiService.exchangeCode(code);

      if (!tokens.access_token) {
        console.error('[StudentOS callback] No access_token in exchange response');
        return res.redirect(`${CLIENT}/student-os?error=oauth_failed`);
      }

      // Get the Google email for this token
      const authClient = GoogleApiService.createOAuthClient();
      authClient.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
      const { data: profile } = await oauth2.userinfo.get();

      console.log('[StudentOS callback] Google profile email:', profile.email);

      // Find the matching httpTechNex user by email
      const user = await User.findOne({ email: profile.email });

      if (!user) {
        console.error('[StudentOS callback] No httpTechNex account found for:', profile.email,
          '— user must sign into httpTechNex first with this Google account.');
        return res.redirect(`${CLIENT}/student-os?error=user_not_found`);
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

      console.log('[StudentOS callback] Connected successfully for user:', user.email);

      // Redirect to StudentOS frontend with success flag
      res.redirect(`${CLIENT}/student-os?connected=true`);
    } catch (err) {
      console.error('[StudentOS OAuth callback] Error:', err.message);
      const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${CLIENT_URL}/student-os?error=oauth_failed`);
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
        // Try to revoke with Google (best-effort)
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
