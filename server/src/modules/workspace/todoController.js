const { Todo } = require('../../models');

// GET /api/todos
const getTodos = async (req, res) => {
  const todos = await Todo.find({ user: req.user._id }).sort({ order: 1, createdAt: -1 });
  res.json({ todos });
};

// POST /api/todos  Body: { text, priority }
const createTodo = async (req, res) => {
  const { text, priority } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Todo text is required.' });
  }
  const count = await Todo.countDocuments({ user: req.user._id });
  const todo = await Todo.create({
    user: req.user._id,
    text: text.trim(),
    priority: priority || 'medium',
    order: count,
  });
  res.status(201).json({ todo });
};

// PATCH /api/todos/:id  Body: { text?, isDone?, priority?, order? }
const updateTodo = async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
  if (!todo) return res.status(404).json({ message: 'Todo not found.' });

  const { text, isDone, priority, order } = req.body;
  if (text !== undefined) todo.text = text.trim();
  if (isDone !== undefined) todo.isDone = isDone;
  if (priority !== undefined) todo.priority = priority;
  if (order !== undefined) todo.order = order;

  await todo.save();
  res.json({ todo });
};

// DELETE /api/todos/:id
const deleteTodo = async (req, res) => {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!todo) return res.status(404).json({ message: 'Todo not found.' });
  res.json({ message: 'Todo deleted.' });
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
