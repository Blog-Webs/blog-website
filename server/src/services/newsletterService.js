/**
 * Newsletter Service for httpTechNex — Brevo Layer
 *
 * Sits ALONGSIDE the existing newsletterController.js (which saves subscribers
 * to MongoDB). This service handles the email dispatch via Brevo and can
 * optionally sync subscribers to a Brevo Contact List for marketing campaigns.
 *
 * Nothing in this file modifies existing controllers or routes.
 *
 * Usage:
 *   const newsletterService = require('../services/newsletterService');
 *   await newsletterService.dispatchBlogPost({ post, subscribers });
 */

const emailService = require('./emailService');

/**
 * Dispatches a blog post notification to all active newsletter subscribers
 * via Brevo transactional emails.
 *
 * Call this from the blog publish flow INSTEAD OF (or alongside) the existing
 * sendBulkMail() in mailer.js — your choice.
 *
 * @param {{
 *   post: {
 *     title: string,
 *     subtitle?: string,
 *     slug: string,
 *     coverImage?: string,
 *     category?: string,
 *     tags?: string[],
 *     author?: { name: string }
 *   },
 *   subscribers: string[]   // array of email address strings
 * }} opts
 */
const dispatchBlogPost = async ({ post, subscribers }) => {
  if (!subscribers || subscribers.length === 0) {
    console.log('[NewsletterService] No subscribers to notify.');
    return { sentCount: 0, failedCount: 0, skipped: false };
  }

  const postUrl = `https://www.httptechnex.online/blog/${post.slug}`;
  const tags = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');

  console.log(`[NewsletterService] Dispatching "${post.title}" to ${subscribers.length} subscriber(s) via Brevo...`);

  const result = await emailService.sendNewsletterEmail({
    recipients: subscribers,
    postTitle: post.title,
    postSubtitle: post.subtitle || '',
    postUrl,
    authorName: post.author?.name || 'httpTechNex Team',
    coverImage: post.coverImage || '',
    category: post.category || '',
    tags,
  });

  console.log(`[NewsletterService] Dispatch complete — sent: ${result.sentCount}, failed: ${result.failedCount}`);
  return result;
};

/**
 * Sends a welcome-to-newsletter confirmation to a new subscriber.
 * Call this from newsletterController.js → subscribe() if you want a
 * confirmation email when someone enters their email in the footer form.
 *
 * @param {{ email: string }} opts
 */
const sendSubscribeConfirmation = async ({ email }) => {
  const { _send } = emailService;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:40px 20px;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#1a1d2e;border-radius:16px;border:1px solid rgba(99,102,241,0.2);margin:0 auto;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 36px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:20px;color:#fff;font-family:monospace;">httpTechNex</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;text-align:center;">
            <p style="font-size:32px;margin:0 0 16px;">📬</p>
            <h2 style="margin:0 0 12px;font-size:18px;color:#e2e8f0;">You're subscribed!</h2>
            <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
              You'll be notified whenever a new blog post is published on httpTechNex.
              No spam — only the articles you signed up for.
            </p>
            <a href="https://www.httptechnex.online/blog"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:11px 24px;border-radius:50px;">
              Browse the Blog →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:#334155;">
              <a href="https://www.httptechnex.online/newsletter/unsubscribe?email=${encodeURIComponent(email)}"
                 style="color:#475569;text-decoration:underline;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="https://www.httptechnex.online" style="color:#6366f1;text-decoration:none;">httptechnex.online</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return _send({
    to: email,
    subject: 'You\'re subscribed to httpTechNex 📬',
    htmlContent: html,
    textContent: `You're now subscribed to the httpTechNex newsletter. You'll get an email whenever a new blog post is published. Unsubscribe at: https://www.httptechnex.online/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
  });
};

module.exports = { dispatchBlogPost, sendSubscribeConfirmation };
