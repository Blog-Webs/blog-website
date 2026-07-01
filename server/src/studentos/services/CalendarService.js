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

const CalendarService = {
  async getUpcomingEvents(userId, days = 7) {
    const cacheKey = `calendar:events:${days}d`;
    const cached = await getCached(userId, cacheKey);
    if (cached) return cached;

    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = (data.items || []).map((e) => ({
      id: e.id,
      title: e.summary || 'Untitled',
      description: e.description || '',
      location: e.location || '',
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      allDay: !e.start?.dateTime,
      meetLink: e.hangoutLink || null,
      htmlLink: e.htmlLink,
      colorId: e.colorId || null,
      status: e.status,
      // Classify event type
      type: classifyEvent(e.summary || '', e.description || ''),
    }));

    await setCache(userId, cacheKey, events, 3 * 60 * 1000);
    return events;
  },

  async getTodayEvents(userId) {
    const all = await this.getUpcomingEvents(userId, 1);
    const today = new Date();
    return all.filter((e) => {
      const start = new Date(e.start);
      return start.toDateString() === today.toDateString();
    });
  },
};

function classifyEvent(title = '', desc = '') {
  const text = (title + ' ' + desc).toLowerCase();
  if (/exam|test|quiz|assessment/.test(text)) return 'exam';
  if (/lab|practical|workshop/.test(text)) return 'lab';
  if (/lecture|class|tutorial/.test(text)) return 'class';
  if (/deadline|submission|due/.test(text)) return 'deadline';
  if (/meet|meeting|interview/.test(text)) return 'meeting';
  return 'event';
}

module.exports = CalendarService;
