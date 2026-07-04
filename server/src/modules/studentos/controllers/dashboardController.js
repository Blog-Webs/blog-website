const ClassroomService = require('../services/ClassroomService');
const CalendarService = require('../services/CalendarService');
const GmailService = require('../services/GmailService');
const DriveService = require('../services/DriveService');
const { enrichAssignments } = require('../utils/priorityEngine');

const dashboardController = {
  // GET /api/studentos/dashboard
  async getDashboard(req, res) {
    const userId = req.user._id;

    // Fetch all data in parallel for speed
    const [assignments, todayEvents, unreadEmails, recentFiles, announcements] = await Promise.allSettled([
      ClassroomService.getAssignments(userId),
      CalendarService.getTodayEvents(userId),
      GmailService.getUnreadEmails(userId, 10),
      DriveService.getRecentFiles(userId),
      ClassroomService.getAnnouncements(userId),
    ]);

    const rawAssignments = assignments.status === 'fulfilled' ? assignments.value : [];
    const enriched = enrichAssignments(rawAssignments);

    // Filter upcoming (not overdue, within next 7 days)
    const upcoming = enriched.filter((a) => a.priority !== 'overdue' && (a.daysUntilDue === null || a.daysUntilDue <= 7));
    const highPriority = enriched.filter((a) => a.priority === 'high' || a.priority === 'overdue').slice(0, 3);

    res.json({
      todayEvents: todayEvents.status === 'fulfilled' ? todayEvents.value : [],
      upcomingAssignments: upcoming.slice(0, 5),
      highPriorityAssignments: highPriority,
      unreadEmails: unreadEmails.status === 'fulfilled' ? unreadEmails.value.slice(0, 5) : [],
      recentFiles: recentFiles.status === 'fulfilled' ? recentFiles.value.slice(0, 6) : [],
      recentAnnouncements: announcements.status === 'fulfilled' ? announcements.value.slice(0, 3) : [],
      stats: {
        totalAssignments: rawAssignments.length,
        highPriorityCount: highPriority.length,
        unreadEmailCount: unreadEmails.status === 'fulfilled' ? unreadEmails.value.length : 0,
        newFilesCount: recentFiles.status === 'fulfilled' ? recentFiles.value.filter((f) => f.isNew).length : 0,
      },
    });
  },
};

module.exports = dashboardController;
