const TasksService = require('../services/TasksService');

const tasksController = {
  async getTaskLists(req, res) {
    const lists = await TasksService.getTaskLists(req.user._id);
    res.json({ lists });
  },

  async getTasks(req, res) {
    const { listId = '@default' } = req.query;
    const tasks = await TasksService.getTasks(req.user._id, listId);
    res.json({ tasks });
  },

  async createTask(req, res) {
    const { listId = '@default' } = req.query;
    const { title, notes, due } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Task title is required.' });
    const task = await TasksService.createTask(req.user._id, listId, { title, notes, due });
    res.status(201).json({ task });
  },

  async updateTask(req, res) {
    const { taskId } = req.params;
    const { listId = '@default' } = req.query;
    const { title, notes, due, status } = req.body;
    const patch = {};
    if (title !== undefined) patch.title = title;
    if (notes !== undefined) patch.notes = notes;
    if (due !== undefined) patch.due = new Date(due).toISOString();
    if (status !== undefined) patch.status = status;
    const task = await TasksService.updateTask(req.user._id, listId, taskId, patch);
    res.json({ task });
  },

  async deleteTask(req, res) {
    const { taskId } = req.params;
    const { listId = '@default' } = req.query;
    await TasksService.deleteTask(req.user._id, listId, taskId);
    res.json({ success: true });
  },

  async completeTask(req, res) {
    const { taskId } = req.params;
    const { listId = '@default' } = req.query;
    const task = await TasksService.completeTask(req.user._id, listId, taskId);
    res.json({ task });
  },
};

module.exports = tasksController;
