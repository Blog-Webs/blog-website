/**
 * Task Engine - Dependency Graphs & Progress Calculator
 */

export function calculateProjectProgress(tasks = []) {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
  return Math.min(100, Math.round(totalProgress / tasks.length));
}

export function updateTaskProgress(tasks, speedMultiplier = 1) {
  return tasks.map((task) => {
    if (task.status === 'COMPLETED') {
      return { ...task, progress: 100 };
    }
    if (task.status === 'IN_PROGRESS' || task.status === 'TESTING' || task.status === 'REVIEW') {
      const increment = (Math.random() * 2 + 1) * speedMultiplier;
      const newProgress = Math.min(100, Math.round((task.progress || 0) + increment));
      const newStatus = newProgress >= 100 ? 'COMPLETED' : task.status;
      return {
        ...task,
        progress: newProgress,
        status: newStatus,
        updatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    return task;
  });
}
