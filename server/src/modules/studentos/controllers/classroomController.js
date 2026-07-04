const ClassroomService = require('../services/ClassroomService');
const { enrichAssignments } = require('../utils/priorityEngine');

const classroomController = {
  async getCourses(req, res) {
    const courses = await ClassroomService.getCourses(req.user._id);
    res.json({ courses });
  },

  async getAssignments(req, res) {
    const { courseId } = req.query;
    const raw = await ClassroomService.getAssignments(req.user._id, courseId || null);
    const assignments = enrichAssignments(raw);
    res.json({ assignments });
  },

  async getAnnouncements(req, res) {
    const { courseId } = req.query;
    const announcements = await ClassroomService.getAnnouncements(req.user._id, courseId || null);
    res.json({ announcements });
  },
};

module.exports = classroomController;
