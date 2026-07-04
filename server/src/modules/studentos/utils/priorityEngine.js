/**
 * Assignment Priority Engine
 * Classifies assignments as 'high', 'medium', or 'low' priority
 * based on due date proximity and keywords.
 */

const HIGH_URGENCY_HOURS = 48; // Due within 48 hours = high
const MED_URGENCY_HOURS = 96;  // Due within 4 days = medium

const EXAM_KEYWORDS = ['exam', 'test', 'quiz', 'assessment', 'mid-term', 'final', 'viva', 'submission'];

function getPriorityLevel(assignment) {
  if (!assignment.dueDate) return 'low';

  const hoursUntilDue = (new Date(assignment.dueDate) - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return 'overdue';

  const title = (assignment.title || '').toLowerCase();
  const isHighKeyword = EXAM_KEYWORDS.some((k) => title.includes(k));

  if (hoursUntilDue <= HIGH_URGENCY_HOURS || (isHighKeyword && hoursUntilDue <= MED_URGENCY_HOURS)) {
    return 'high';
  }
  if (hoursUntilDue <= MED_URGENCY_HOURS) {
    return 'medium';
  }
  return 'low';
}

function enrichAssignments(assignments) {
  return assignments.map((a) => ({
    ...a,
    priority: getPriorityLevel(a),
    daysUntilDue: a.dueDate
      ? Math.max(0, Math.ceil((new Date(a.dueDate) - Date.now()) / (1000 * 60 * 60 * 24)))
      : null,
  }));
}

module.exports = { getPriorityLevel, enrichAssignments };
