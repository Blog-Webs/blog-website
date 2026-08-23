const { google } = require('googleapis');
const GoogleApiService = require('./GoogleApiService');
const { getCached, setCache } = require('./CacheHelper');

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

  async createEvent(userId, { title, description, start, end, allDay, color }) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const resource = { summary: title, description: description || '' };
    if (color) resource.colorId = color;

    if (allDay) {
      resource.start = { date: start };
      resource.end = { date: end || start };
    } else {
      resource.start = { dateTime: start, timeZone: 'Asia/Kolkata' };
      resource.end = { dateTime: end || new Date(new Date(start).getTime() + 3600000).toISOString(), timeZone: 'Asia/Kolkata' };
    }

    const { data } = await calendar.events.insert({ calendarId: 'primary', requestBody: resource });
    await this._invalidateCache(userId);

    return {
      id: data.id,
      title: data.summary,
      description: data.description || '',
      start: data.start?.dateTime || data.start?.date,
      end: data.end?.dateTime || data.end?.date,
      allDay: !data.start?.dateTime,
      htmlLink: data.htmlLink,
      type: classifyEvent(data.summary || '', data.description || ''),
    };
  },

  async updateEvent(userId, eventId, { title, description, start, end, allDay, color }) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const patch = {};
    if (title !== undefined) patch.summary = title;
    if (description !== undefined) patch.description = description;
    if (color !== undefined) patch.colorId = color;
    if (start !== undefined) {
      if (allDay) {
        patch.start = { date: start };
        patch.end = { date: end || start };
      } else {
        patch.start = { dateTime: start, timeZone: 'Asia/Kolkata' };
        patch.end = { dateTime: end || new Date(new Date(start).getTime() + 3600000).toISOString(), timeZone: 'Asia/Kolkata' };
      }
    }

    const { data } = await calendar.events.patch({ calendarId: 'primary', eventId, requestBody: patch });
    await this._invalidateCache(userId);

    return {
      id: data.id,
      title: data.summary,
      start: data.start?.dateTime || data.start?.date,
      end: data.end?.dateTime || data.end?.date,
    };
  },

  async deleteEvent(userId, eventId) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({ calendarId: 'primary', eventId });
    await this._invalidateCache(userId);
    return { success: true };
  },

  async _invalidateCache(userId) {
    const StudentOSCache = require('../models/StudentOSCache');
    await StudentOSCache.deleteMany({ user: userId, cacheKey: { $regex: /^calendar:/ } });
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