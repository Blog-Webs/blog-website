const { Newsletter } = require('../../models');

// POST /api/newsletter/subscribe  Body: { email }
const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email is required.' });
  }

  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return res.json({ message: 'You are subscribed.' });
  }

  await Newsletter.create({
    email: email.toLowerCase(),
    user: req.user ? req.user._id : undefined,
  });
  res.status(201).json({ message: 'Subscribed! Watch your inbox for the next issue.' });
};

// POST /api/newsletter/unsubscribe  Body: { email }
const unsubscribe = async (req, res) => {
  const { email } = req.body;
  await Newsletter.findOneAndUpdate({ email: (email || '').toLowerCase() }, { isActive: false });
  res.json({ message: 'You have been unsubscribed.' });
};

// GET /api/newsletter/admin/subscribers  -- admin only
const getSubscribers = async (req, res) => {
  const subscribers = await Newsletter.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ subscribers, count: subscribers.length });
};

module.exports = { subscribe, unsubscribe, getSubscribers };
