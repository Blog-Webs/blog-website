const { google } = require('googleapis');
const GoogleApiService = require('./GoogleApiService');

const TasksService = {
  async getTaskLists(userId) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const tasks = google.tasks({ version: 'v1', auth });
    const { data } = await tasks.tasklists.list({ maxResults: 20 });
    return (data.items || []).map((l) => ({
      id: l.id,
      title: l.title,
      updatedAt: l.updated,
    }));
  },

  async getTasks(userId, taskListId = '@default') {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const tasks = google.tasks({ version: 'v1', auth });

    const { data } = await tasks.tasks.list({
      tasklist: taskListId,
      showCompleted: true,
      showHidden: false,
      maxResults: 100,
    });

    return (data.items || []).map((t) => ({
      id: t.id,
      title: t.title,
      notes: t.notes || '',
      status: t.status, // 'needsAction' | 'completed'
      due: t.due || null,
      completed: t.completed || null,
      updated: t.updated,
    }));
  },

  async createTask(userId, taskListId = '@default', { title, notes, due }) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const tasks = google.tasks({ version: 'v1', auth });

    const { data } = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody: {
        title,
        notes: notes || '',
        due: due ? new Date(due).toISOString() : undefined,
        status: 'needsAction',
      },
    });

    return { id: data.id, title: data.title, status: data.status, due: data.due };
  },

  async updateTask(userId, taskListId = '@default', taskId, patch) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const tasks = google.tasks({ version: 'v1', auth });

    const { data } = await tasks.tasks.patch({
      tasklist: taskListId,
      task: taskId,
      requestBody: patch,
    });

    return { id: data.id, title: data.title, status: data.status };
  },

  async deleteTask(userId, taskListId = '@default', taskId) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const tasks = google.tasks({ version: 'v1', auth });
    await tasks.tasks.delete({ tasklist: taskListId, task: taskId });
    return { success: true };
  },

  async completeTask(userId, taskListId = '@default', taskId) {
    return this.updateTask(userId, taskListId, taskId, {
      status: 'completed',
      completed: new Date().toISOString(),
    });
  },
};

module.exports = TasksService;
