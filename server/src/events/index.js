const eventBus = require('./EventBus');
const { sendMail } = require('../utils/mailer');
const AdminNotification = require('../modules/admin/AdminNotification');

// --- User Registration Event ---
eventBus.on('UserRegistered', async (user) => {
  try {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Welcome to HttpTechNex, ${user.name}!</h2>
        <p>We are thrilled to have you join our developer community.</p>
        <h3>Here is what you can do next:</h3>
        <ul>
          <li><strong>StudentOS:</strong> Access your personal Drive, manage tasks, and sync your Calendar.</li>
          <li><strong>Learn Platform:</strong> Dive into comprehensive programming subjects and tracks.</li>
          <li><strong>Community Forum:</strong> Ask questions, share knowledge, and engage with peers.</li>
          <li><strong>Tech Blogs:</strong> Read cutting-edge articles written by experts.</li>
        </ul>
        <p>Log in now to start exploring!</p>
        <p>Best,<br/>The HttpTechNex Team</p>
      </div>
    `;

    await sendMail({
      to: user.email,
      subject: 'Welcome to HttpTechNex! 🎉',
      html: htmlContent,
      text: `Welcome to HttpTechNex, ${user.name}! We're thrilled to have you. Explore StudentOS, Learn Platform, Forum, and Blogs today.`
    });
    console.log(`[EDA] Processed UserRegistered event for ${user.email}`);
  } catch (err) {
    console.error('[EDA] Error processing UserRegistered event:', err.message);
  }
});

// --- Action Events (Likes, Comments) ---
eventBus.on('ActionOccurred', async (data) => {
  try {
    const { type, message, metadata } = data;
    await AdminNotification.create({
      type,
      message,
      metadata
    });
    console.log(`[EDA] Processed ActionOccurred event: ${type}`);
  } catch (err) {
    console.error('[EDA] Error processing ActionOccurred event:', err.message);
  }
});

// We can add more listeners here for search indexing, analytics, gamification points, etc.

module.exports = eventBus;
