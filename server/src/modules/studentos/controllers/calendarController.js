const CalendarService = require('../services/CalendarService');

const calendarController = {
  async getEvents(req, res) {
    const days = parseInt(req.query.days) || 30;
    const events = await CalendarService.getUpcomingEvents(req.user._id, Math.min(days, 90));
    res.json({ events });
  },

  async getTodayEvents(req, res) {
    const events = await CalendarService.getTodayEvents(req.user._id);
    res.json({ events });
  },

  async createEvent(req, res) {
    const { title, description, start, end, allDay, color } = req.body;
    if (!title || !start) return res.status(400).json({ error: 'title and start are required' });
    const event = await CalendarService.createEvent(req.user._id, { title, description, start, end, allDay, color });
    res.status(201).json({ event });
  },

  async updateEvent(req, res) {
    const { eventId } = req.params;
    const event = await CalendarService.updateEvent(req.user._id, eventId, req.body);
    res.json({ event });
  },

  async deleteEvent(req, res) {
    const { eventId } = req.params;
    await CalendarService.deleteEvent(req.user._id, eventId);
    res.json({ success: true });
  },
};

module.exports = calendarController;