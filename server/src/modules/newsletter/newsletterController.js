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

  const newsletterService = require('../../services/newsletterService');
  newsletterService.sendSubscribeConfirmation({ email: email.toLowerCase() })
    .catch((err) => console.error('[NewsletterController] Email send error:', err.message));

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

// POST /api/newsletter/admin/subscribers  -- admin add
const addSubscriberAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.isActive = true;
    await existing.save();
    return res.json({ message: 'Subscriber reactivated.', subscriber: existing });
  }

  const subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    isActive: true,
  });

  res.status(201).json({ message: 'Subscriber added successfully.', subscriber });
};

// DELETE /api/newsletter/admin/subscribers/:id  -- admin delete single
const deleteSubscriber = async (req, res) => {
  const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found.' });
  res.json({ message: 'Subscriber deleted successfully.' });
};

// POST /api/newsletter/admin/subscribers/delete-batch  -- admin delete batch
const deleteSubscribersBatch = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Array of subscriber IDs is required.' });
  }

  await Newsletter.deleteMany({ _id: { $in: ids } });
  res.json({ message: `${ids.length} subscriber(s) deleted successfully.` });
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  addSubscriberAdmin,
  deleteSubscriber,
  deleteSubscribersBatch,
};
