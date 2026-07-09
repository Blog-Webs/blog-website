/**
 * Brevo (formerly Sendinblue) API client configuration.
 *
 * This is a NEW email service running ALONGSIDE the existing nodemailer/SMTP
 * mailer (server/src/utils/mailer.js). Nothing in the existing codebase is
 * changed — this is purely additive.
 *
 * Usage:
 *   const { getBrevoClient } = require('../config/brevo');
 *   const client = getBrevoClient();  // returns null if not configured (dev mode)
 */

let brevoApi = null;
let isConfigured = false;

/**
 * Lazily initialises the Brevo Transactional Email API client.
 * Returns null + logs a warning if BREVO_API_KEY is not set, so the rest
 * of the application keeps working in local dev without real credentials.
 */
const getBrevoClient = () => {
  if (brevoApi) return brevoApi;

  if (!process.env.BREVO_API_KEY) {
    if (!isConfigured) {
      console.warn(
        '[Brevo] BREVO_API_KEY not set — Brevo email service is disabled. ' +
        'Add it to your environment variables to enable it.'
      );
      isConfigured = true;
    }
    return null;
  }

  try {
    // Dynamic require so the app doesn't crash if the SDK isn't installed yet
    const SibApiV3Sdk = require('@getbrevo/brevo');
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    brevoApi = apiInstance;
    isConfigured = true;
    console.log('[Brevo] Email API client initialised successfully.');
    return brevoApi;
  } catch (err) {
    console.warn(
      '[Brevo] Could not load @getbrevo/brevo SDK. ' +
      'Run: cd server && npm install @getbrevo/brevo\n' +
      `Error: ${err.message}`
    );
    return null;
  }
};

/**
 * Default sender details read from environment variables.
 * These must match a verified sender in your Brevo dashboard.
 */
const getDefaultSender = () => ({
  name: process.env.BREVO_SENDER_NAME || 'httpTechNex',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@httptechnex.online',
});

module.exports = { getBrevoClient, getDefaultSender };
