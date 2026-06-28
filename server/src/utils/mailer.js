const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP_HOST/SMTP_USER/SMTP_PASS not configured — emails will be skipped.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Sends an email. Silently no-ops (with a console warning) if SMTP isn't
 * configured, so the rest of the app keeps working in local dev without
 * real email credentials.
 */
const sendMail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) return { skipped: true };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await t.sendMail({ from, to, subject, html, text });
    return { skipped: false, sent: true };
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err.message);
    return { skipped: false, sent: false, error: err.message };
  }
};

/**
 * Sends the same email to many recipients, in small batches, so a single
 * SMTP call doesn't try to push hundreds of addresses at once (some
 * providers cap recipients per request, and silent partial failures are
 * easier to diagnose this way).
 */
const sendBulkMail = async ({ recipients, subject, html, text, batchSize = 40 }) => {
  const t = getTransporter();
  if (!t) return { skipped: true, sentCount: 0 };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  let sentCount = 0;
  const failed = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    try {
      await t.sendMail({ from, bcc: batch, subject, html, text });
      sentCount += batch.length;
    } catch (err) {
      console.error('[Mailer] Batch send failed:', err.message);
      failed.push(...batch);
    }
  }

  return { skipped: false, sentCount, failedCount: failed.length };
};

module.exports = { sendMail, sendBulkMail };
