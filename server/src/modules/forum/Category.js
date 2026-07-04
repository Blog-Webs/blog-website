const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String, // lucide icon name like 'message-circle', 'help-circle'
    default: 'message-circle'
  },
  order: {
    type: Number,
    default: 0
  },
  topicCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save middleware to generate slug if not provided
categorySchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('ForumCategory', categorySchema);
