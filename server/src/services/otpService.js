/**
 * OTP Service for httpTechNex
 *
 * Generates, stores (in-memory with TTL), verifies, and sends OTP codes
 * via the Brevo emailService. Uses a Map so no extra DB schema is needed
 * for short-lived codes; upgrade to Redis for multi-instance deployments.
 *
 * Usage:
 *   const otpService = require('../services/otpService');
 *
 *   // Generate + send
 *   await otpService.generateAndSend({ userName: 'Alice', userEmail: 'alice@example.com' });
 *
 *   // Verify submitted code
 *   const result = otpService.verify('alice@example.com', '482931');
 *   if (result.valid) { ... }
 */

const crypto = require('crypto');
const emailService = require('./emailService');

// In-memory store: email → { code, expiresAt }
const otpStore = new Map();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
const OTP_LENGTH = 6;

/** Generates a cryptographically random numeric OTP. */
const _generateCode = () => {
  // crypto.randomInt is available in Node 14.10+
  const max = Math.pow(10, OTP_LENGTH);
  const code = crypto.randomInt(0, max);
  return String(code).padStart(OTP_LENGTH, '0');
};

/**
 * Generates a new OTP for the given email, stores it, and emails it.
 *
 * @param {{ userName:string, userEmail:string }} opts
 * @returns {Promise<{code:string, result:object}>}
 */
const generateAndSend = async ({ userName, userEmail }) => {
  const code = _generateCode();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  otpStore.set(userEmail.toLowerCase(), { code, expiresAt });

  // Auto-clean after expiry to avoid memory leak
  setTimeout(() => otpStore.delete(userEmail.toLowerCase()), OTP_EXPIRY_MINUTES * 60 * 1000 + 5000);

  console.log(`[OTPService] Generated OTP for ${userEmail} (expires in ${OTP_EXPIRY_MINUTES} min)`);

  const result = await emailService.sendOTPEmail({
    userName,
    userEmail,
    otpCode: code,
    expiryMinutes: OTP_EXPIRY_MINUTES,
  });

  return { code, result };
};

/**
 * Verifies a submitted OTP code.
 *
 * @param {string} email
 * @param {string} submittedCode
 * @returns {{ valid: boolean, reason?: string }}
 */
const verify = (email, submittedCode) => {
  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return { valid: false, reason: 'No OTP found for this email. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }

  if (record.code !== String(submittedCode).trim()) {
    return { valid: false, reason: 'Incorrect OTP. Please try again.' };
  }

  // Invalidate after successful verification (single-use)
  otpStore.delete(email.toLowerCase());
  return { valid: true };
};

/**
 * Manually invalidates a pending OTP (e.g. user requested resend).
 * @param {string} email
 */
const invalidate = (email) => {
  otpStore.delete(email.toLowerCase());
};

module.exports = { generateAndSend, verify, invalidate };
