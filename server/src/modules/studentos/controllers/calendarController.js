const CalendarService = require('../services/CalendarService');

const calendarController = {
  async getEvents(req, res) {
    const days = parseInt(req.query.days) || 7;
    const events = await CalendarService.getUpcomingEvents(req.user._id, Math.min(days, 30));
    res.json({ events });
  },

  async getTodayEvents(req, res) {
    const events = await CalendarService.getTodayEvents(req.user._id);
    res.json({ events });
  },
};

module.exports = calendarController;
