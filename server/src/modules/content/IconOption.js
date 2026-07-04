const mongoose = require('mongoose');

const iconOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    iconUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IconOption', iconOptionSchema);
