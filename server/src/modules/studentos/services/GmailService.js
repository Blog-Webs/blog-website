const { google } = require('googleapis');
const GoogleApiService = require('./GoogleApiService');
const StudentOSCache = require('../models/StudentOSCache');

async function getCached(userId, key) {
  try {
    const entry = await StudentOSCache.findOne({ user: userId, cacheKey: key });
    if (entry && entry.expiresAt > new Date()) return entry.data;
    return null;
  } catch { return null; }
}
async function setCache(userId, key, data, ttlMs = 5 * 60 * 1000) {
  try {
    await StudentOSCache.findOneAndUpdate(
      { user: userId, cacheKey: key },
      { data, expiresAt: new Date(Date.now() + ttlMs) },
      { upsert: true }
    );
  } catch {}
}

// Keywords to detect teacher/placement emails
const TEACHER_KEYWORDS = ['faculty', 'professor', 'hod', 'department', 'college', 'university', 'registrar', 'academic'];
const PLACEMENT_KEYWORDS = ['placement', 'internship', 'job', 'campus', 'recruitment', 'hr', 'career', 'offer'];

function classifyEmail(subject = '', from = '') {
  const text = (subject + ' ' + from).toLowerCase();
  if (PLACEMENT_KEYWORDS.some((k) => text.includes(k))) return 'placement';
  if (TEACHER_KEYWORDS.some((k) => text.includes(k))) return 'teacher';
  return 'general';
}

const GmailService = {
  async getUnreadEmails(userId, maxResults = 20) {
    const cacheKey = 'gmail:unread';
    const cached = await getCached(userId, cacheKey);
    if (cached) return cached;

    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const { data: listData } = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults,
    });

    if (!listData.messages?.length) {
      await setCache(userId, cacheKey, []);
      return [];
    }

    const emails = await Promise.all(
      (listData.messages || []).map(async (msg) => {
        try {
          const { data } = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          });
          const headers = data.payload?.headers || [];
          const getHeader = (name) => headers.find((h) => h.name === name)?.value || '';
          const subject = getHeader('Subject');
          const from = getHeader('From');
          const date = getHeader('Date');
          return {
            id: msg.id,
            threadId: data.threadId,
            subject,
            from,
            date,
            snippet: data.snippet || '',
            category: classifyEmail(subject, from),
            labels: data.labelIds || [],
            isUnread: (data.labelIds || []).includes('UNREAD'),
          };
        } catch { return null; }
      })
    );

    const result = emails.filter(Boolean);
    await setCache(userId, cacheKey, result, 3 * 60 * 1000);
    return result;
  },

  async getEmailBody(userId, messageId) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const { data } = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    // Extract plain text body
    let body = '';
    function extractBody(payload) {
      if (!payload) return;
      if (payload.mimeType === 'text/plain' && payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload.parts) {
        payload.parts.forEach(extractBody);
      }
    }
    extractBody(data.payload);

    return { id: messageId, body: body.slice(0, 5000) }; // limit for AI
  },

  async markAsRead(userId, messageId) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const gmail = google.gmail({ version: 'v1', auth });
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: { removeLabelIds: ['UNREAD'] },
    });
    // Invalidate cache
    await StudentOSCache.deleteOne({ user: userId, cacheKey: 'gmail:unread' });
    return { success: true };
  },

  async searchEmails(userId, query) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const { data: listData } = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10,
    });

    if (!listData.messages?.length) return [];

    const emails = await Promise.all(
      (listData.messages || []).map(async (msg) => {
        try {
          const { data } = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          });
          const headers = data.payload?.headers || [];
          const getHeader = (name) => headers.find((h) => h.name === name)?.value || '';
          return {
            id: msg.id,
            subject: getHeader('Subject'),
            from: getHeader('From'),
            date: getHeader('Date'),
            snippet: data.snippet || '',
            category: classifyEmail(getHeader('Subject'), getHeader('From')),
          };
        } catch { return null; }
      })
    );
    return emails.filter(Boolean);
  },
};

module.exports = GmailService;
