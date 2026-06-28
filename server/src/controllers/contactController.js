const { Contact } = require('../models');

const VALID_TYPES = ['bug', 'support', 'review'];

// POST /api/contact  Body varies by type:
//  bug/support: { type, name, email, subject, message }
//  review:      { type, name, email, role, review }
const submitContact = async (req, res) => {
  const { type, name, email, subject, message, role, review } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ message: 'type must be one of: bug, support, review.' });
  }
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  if (type === 'review') {
    if (!role?.trim() || !review?.trim()) {
      return res.status(400).json({ message: 'Role and review are required.' });
    }
  } else {
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }
  }

  const contact = await Contact.create({
    type,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim(),
    message: message?.trim(),
    role: role?.trim(),
    review: review?.trim(),
    user: req.user ? req.user._id : undefined,
  });

  res.status(201).json({ message: "Thanks — we've received it.", id: contact._id });
};

// GET /api/contact/admin/all?type=  -- admin only
const getAllContacts = async (req, res) => {
  const filter = {};
  if (req.query.type && VALID_TYPES.includes(req.query.type)) filter.type = req.query.type;

  const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  res.json({ contacts });
};

// PATCH /api/contact/admin/:id/read  -- admin only
const markAsRead = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!contact) return res.status(404).json({ message: 'Not found.' });
  res.json({ contact });
};

module.exports = { submitContact, getAllContacts, markAsRead };
