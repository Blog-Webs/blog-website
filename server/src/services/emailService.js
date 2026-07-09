/**
 * Centralized Brevo Email Service for httpTechNex
 *
 * This service is ADDITIVE — it does not replace or modify the existing
 * nodemailer/SMTP mailer (server/src/utils/mailer.js). Both can coexist.
 *
 * Usage:
 *   const emailService = require('../services/emailService');
 *   await emailService.sendWelcomeEmail({ userName: 'Alice', userEmail: 'alice@example.com' });
 *
 * All functions gracefully no-op (log a warning) if BREVO_API_KEY is not
 * configured, so the app never crashes in local development.
 */

const fs = require('fs');
const path = require('path');
const { getBrevoClient, getDefaultSender } = require('../config/brevo');

// ─── Template loader ──────────────────────────────────────────────────────────
const TEMPLATES_DIR = path.join(__dirname, '../templates');

/**
 * Reads an HTML template file and replaces {{placeholderKey}} tokens with
 * the values supplied in the `vars` object.
 *
 * Supports a simple conditional {{#if key}}…{{/if}} block: if `vars[key]` is
 * falsy the entire block (including the tags) is removed from the output.
 */
const renderTemplate = (templateName, vars = {}) => {
  const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`[EmailService] Template not found: ${templateName}.html`);
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  // Process {{#if key}}…{{/if}} blocks
  html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, inner) => {
    return vars[key] ? inner : '';
  });

  // Replace {{key}} tokens
  Object.entries(vars).forEach(([key, value]) => {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
  });

  // Remove any remaining unresolved tokens
  html = html.replace(/\{\{\w+\}\}/g, '');

  return html;
};

// ─── Core send helper ─────────────────────────────────────────────────────────

/**
 * Low-level Brevo send. All public functions below call this.
 * @param {object} opts
 * @param {string|string[]} opts.to         – recipient email(s)
 * @param {string} opts.subject
 * @param {string} opts.htmlContent         – rendered HTML string
 * @param {string} [opts.textContent]       – plain-text fallback
 * @param {object} [opts.replyTo]           – { email, name }
 * @returns {Promise<{sent:boolean, skipped:boolean, messageId?:string, error?:string}>}
 */
const _send = async ({ to, subject, htmlContent, textContent, replyTo }) => {
  const client = getBrevoClient();

  if (!client) {
    return { sent: false, skipped: true };
  }

  try {
    const SibApiV3Sdk = require('@getbrevo/brevo');
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    const sender = getDefaultSender();

    sendSmtpEmail.sender = sender;

    // to can be a single email string or an array of strings
    const toArray = Array.isArray(to) ? to : [to];
    sendSmtpEmail.to = toArray.map((email) =>
      typeof email === 'string' ? { email } : email
    );

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    if (textContent) sendSmtpEmail.textContent = textContent;
    if (replyTo) sendSmtpEmail.replyTo = replyTo;

    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log(`[EmailService] Sent "${subject}" → ${toArray.join(', ')} (messageId: ${result?.body?.messageId})`);
    return { sent: true, skipped: false, messageId: result?.body?.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send "${subject}":`, err.message);
    return { sent: false, skipped: false, error: err.message };
  }
};

/**
 * Bulk send to many recipients individually (one API call per recipient
 * to avoid recipients seeing each other's addresses, and to support
 * per-recipient variables in the future).
 *
 * For very large lists, consider Brevo's Campaign API instead.
 *
 * @param {object} opts
 * @param {string[]} opts.recipients – array of email address strings
 * @param {string}   opts.subject
 * @param {function} opts.htmlBuilder – (recipientEmail) => htmlString
 * @param {string}   [opts.textContent]
 * @returns {Promise<{sentCount:number, failedCount:number, skipped:boolean}>}
 */
const _sendBulk = async ({ recipients, subject, htmlBuilder, textContent }) => {
  const client = getBrevoClient();
  if (!client) return { sentCount: 0, failedCount: 0, skipped: true };

  let sentCount = 0;
  let failedCount = 0;

  for (const email of recipients) {
    const html = typeof htmlBuilder === 'function' ? htmlBuilder(email) : htmlBuilder;
    const result = await _send({ to: email, subject, htmlContent: html, textContent });
    if (result.sent) sentCount++;
    else failedCount++;
  }

  return { sentCount, failedCount, skipped: false };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends a welcome email to a newly registered user.
 * Triggered by the UserRegistered EventBus event (drop-in alongside existing mailer).
 *
 * @param {{ userName: string, userEmail: string }} opts
 */
const sendWelcomeEmail = async ({ userName, userEmail }) => {
  const html = renderTemplate('welcome', { userName });
  return _send({
    to: userEmail,
    subject: `Welcome to httpTechNex, ${userName}! 🎉`,
    htmlContent: html,
    textContent: `Welcome to httpTechNex, ${userName}! Explore the Learn Platform, StudentOS AI, Community Forum, and Tech Blog at https://www.httptechnex.online`,
  });
};

/**
 * Sends a confirmation email to the user after they submit the Contact form.
 * Sends a notification email to the admin/support mailbox as well.
 *
 * @param {{ userName:string, userEmail:string, contactType:string, subject:string, message:string }} opts
 */
const sendContactEmail = async ({ userName, userEmail, contactType, subject, message }) => {
  const typeLabel = { bug: 'Bug Report', support: 'Support Request', review: 'Review' }[contactType] || contactType;

  // 1. Auto-reply to the submitter
  const userHtml = renderTemplate('contact', {
    userName,
    contactType: typeLabel,
    subject: subject || '(no subject)',
    message: message || '(no message)',
  });

  const userResult = await _send({
    to: userEmail,
    subject: `We received your ${typeLabel} — httpTechNex`,
    htmlContent: userHtml,
    textContent: `Hi ${userName}, we received your ${typeLabel}. Our team will review it shortly.`,
  });

  // 2. Notify support inbox
  const supportEmail = process.env.BREVO_SUPPORT_EMAIL || process.env.BREVO_SENDER_EMAIL || 'support@httptechnex.online';
  const adminHtml = renderTemplate('admin-alert', {
    alertType: typeLabel,
    alertTitle: `New ${typeLabel} from ${userName}`,
    alertMessage: `Subject: ${subject || '(no subject)'}\n\n${message || '(no message)'}`,
    metadata: `From: ${userEmail}`,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  });

  const adminResult = await _send({
    to: supportEmail,
    subject: `[httpTechNex] New ${typeLabel}: ${subject || '(no subject)'}`,
    htmlContent: adminHtml,
    replyTo: { email: userEmail, name: userName },
  });

  return { userResult, adminResult };
};

/**
 * Sends a newsletter / blog-publication notification to a list of subscribers.
 *
 * @param {{
 *   recipients: string[],
 *   postTitle: string,
 *   postSubtitle: string,
 *   postUrl: string,
 *   authorName: string,
 *   coverImage?: string,
 *   category?: string,
 *   tags?: string,
 * }} opts
 */
const sendNewsletterEmail = async ({
  recipients,
  postTitle,
  postSubtitle,
  postUrl,
  authorName,
  coverImage = '',
  category = '',
  tags = '',
}) => {
  const subject = `New post: ${postTitle}`;

  return _sendBulk({
    recipients,
    subject,
    htmlBuilder: (recipientEmail) =>
      renderTemplate('newsletter', {
        postTitle,
        postSubtitle,
        postUrl,
        authorName,
        coverImage,
        category,
        tags,
        recipientEmail,
      }),
    textContent: `New post on httpTechNex: "${postTitle}" by ${authorName}. Read it here: ${postUrl}`,
  });
};

/**
 * Sends an OTP verification code.
 *
 * @param {{ userName:string, userEmail:string, otpCode:string, expiryMinutes?:number }} opts
 */
const sendOTPEmail = async ({ userName, userEmail, otpCode, expiryMinutes = 10 }) => {
  const html = renderTemplate('otp', { userName, otpCode, expiryMinutes: String(expiryMinutes) });
  return _send({
    to: userEmail,
    subject: `Your httpTechNex verification code: ${otpCode}`,
    htmlContent: html,
    textContent: `Your httpTechNex verification code is ${otpCode}. It expires in ${expiryMinutes} minutes. Never share this code.`,
  });
};

/**
 * Sends an admin notification/alert email to the configured admin inbox.
 *
 * @param {{ alertType:string, alertTitle:string, alertMessage:string, metadata?:string }} opts
 */
const sendAdminAlert = async ({ alertType, alertTitle, alertMessage, metadata = '' }) => {
  const adminEmail = process.env.BREVO_ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL || 'admin@httptechnex.online';

  const html = renderTemplate('admin-alert', {
    alertType,
    alertTitle,
    alertMessage,
    metadata,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  });

  return _send({
    to: adminEmail,
    subject: `[Admin Alert] ${alertTitle}`,
    htmlContent: html,
  });
};

/**
 * Sends a StudentOS assignment / calendar reminder.
 * Uses the welcome template structure but with custom content for now;
 * add a dedicated template later if needed.
 *
 * @param {{ userName:string, userEmail:string, reminderTitle:string, reminderBody:string, dueDate?:string }} opts
 */
const sendStudentOSReminder = async ({ userName, userEmail, reminderTitle, reminderBody, dueDate }) => {
  const dueLine = dueDate ? `<p style="margin:12px 0 0;font-size:13px;color:#f59e0b;">📅 Due: <strong>${dueDate}</strong></p>` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:40px 20px;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1d2e;border-radius:16px;border:1px solid rgba(99,102,241,0.2);margin:0 auto;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 36px;border-radius:16px 16px 0 0;">
            <h1 style="margin:0;font-size:18px;color:#fff;font-family:monospace;">StudentOS Reminder 🎓</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 8px;font-size:15px;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${userName}</strong>,</p>
            <h2 style="margin:12px 0;font-size:18px;color:#e2e8f0;">${reminderTitle}</h2>
            <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.7;">${reminderBody}</p>
            ${dueLine}
            <p style="margin:24px 0 0;">
              <a href="https://www.httptechnex.online/student-os"
                 style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:11px 24px;border-radius:50px;">
                Open StudentOS →
              </a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:#334155;">© 2025 httpTechNex · <a href="https://www.httptechnex.online" style="color:#6366f1;text-decoration:none;">httptechnex.online</a></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return _send({
    to: userEmail,
    subject: `⏰ Reminder: ${reminderTitle}`,
    htmlContent: html,
    textContent: `StudentOS Reminder: ${reminderTitle}\n\n${reminderBody}${dueDate ? `\n\nDue: ${dueDate}` : ''}`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendContactEmail,
  sendNewsletterEmail,
  sendOTPEmail,
  sendAdminAlert,
  sendStudentOSReminder,
  // Expose internals for advanced use cases
  renderTemplate,
  _send,
  _sendBulk,
};
