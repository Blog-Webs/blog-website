const { google } = require('googleapis');
const GoogleApiService = require('./GoogleApiService');
const StudentOSCache = require('../models/StudentOSCache');

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getCached(userId, key) {
  try {
    const entry = await StudentOSCache.findOne({ user: userId, cacheKey: key });
    if (entry && entry.expiresAt > new Date()) return entry.data;
    return null;
  } catch { return null; }
}

async function setCache(userId, key, data, ttlMs = CACHE_TTL_MS) {
  try {
    await StudentOSCache.findOneAndUpdate(
      { user: userId, cacheKey: key },
      { data, expiresAt: new Date(Date.now() + ttlMs) },
      { upsert: true }
    );
  } catch {}
}

const ClassroomService = {
  async getCourses(userId) {
    const cacheKey = 'classroom:courses';
    const cached = await getCached(userId, cacheKey);
    if (cached) return cached;

    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const classroom = google.classroom({ version: 'v1', auth });

    const { data } = await classroom.courses.list({ courseStates: ['ACTIVE'], pageSize: 20 });
    const courses = (data.courses || []).map((c) => ({
      id: c.id,
      name: c.name,
      section: c.section || '',
      description: c.description || '',
      ownerId: c.ownerId,
      enrollmentCode: c.enrollmentCode || '',
      courseState: c.courseState,
      alternateLink: c.alternateLink,
      creationTime: c.creationTime,
      updateTime: c.updateTime,
    }));

    await setCache(userId, cacheKey, courses);
    return courses;
  },

  async getAssignments(userId, courseId = null) {
    const cacheKey = `classroom:assignments:${courseId || 'all'}`;
    const cached = await getCached(userId, cacheKey);
    if (cached) return cached;

    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const classroom = google.classroom({ version: 'v1', auth });

    let courseIds = [];
    if (courseId) {
      courseIds = [courseId];
    } else {
      const courses = await this.getCourses(userId);
      courseIds = courses.slice(0, 5).map((c) => c.id); // Limit API calls
    }

    const allAssignments = [];
    await Promise.all(
      courseIds.map(async (cid) => {
        try {
          const { data } = await classroom.courses.courseWork.list({
            courseId: cid,
            orderBy: 'dueDate desc',
            pageSize: 20,
          });
          const works = (data.courseWork || []).map((w) => ({
            id: w.id,
            courseId: cid,
            title: w.title,
            description: w.description || '',
            state: w.state,
            dueDate: w.dueDate ? new Date(w.dueDate.year, w.dueDate.month - 1, w.dueDate.day) : null,
            dueTime: w.dueTime || null,
            maxPoints: w.maxPoints || 0,
            workType: w.workType,
            alternateLink: w.alternateLink,
            creationTime: w.creationTime,
          }));
          allAssignments.push(...works);
        } catch {}
      })
    );

    // Sort by due date
    allAssignments.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    await setCache(userId, cacheKey, allAssignments, 5 * 60 * 1000);
    return allAssignments;
  },

  async getAnnouncements(userId, courseId = null) {
    const cacheKey = `classroom:announcements:${courseId || 'all'}`;
    const cached = await getCached(userId, cacheKey);
    if (cached) return cached;

    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const classroom = google.classroom({ version: 'v1', auth });

    let courseIds = [];
    if (courseId) {
      courseIds = [courseId];
    } else {
      const courses = await this.getCourses(userId);
      courseIds = courses.slice(0, 5).map((c) => c.id);
    }

    const announcements = [];
    await Promise.all(
      courseIds.map(async (cid) => {
        try {
          const { data } = await classroom.courses.announcements.list({
            courseId: cid,
            orderBy: 'updateTime desc',
            pageSize: 10,
          });
          (data.announcements || []).forEach((a) => {
            announcements.push({
              id: a.id,
              courseId: cid,
              text: a.text || '',
              state: a.state,
              alternateLink: a.alternateLink,
              creationTime: a.creationTime,
              updateTime: a.updateTime,
              creatorUserId: a.creatorUserId,
              materials: (a.materials || []).map((m) => ({
                driveFile: m.driveFile?.driveFile || null,
                link: m.link || null,
              })),
            });
          });
        } catch {}
      })
    );

    announcements.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
    await setCache(userId, cacheKey, announcements, 5 * 60 * 1000);
    return announcements;
  },
};

module.exports = ClassroomService;
