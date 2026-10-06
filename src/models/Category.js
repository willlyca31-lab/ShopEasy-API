const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, default: '', trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

// Unique name, case-insensitive ("Electronics" and "electronics" count as the same).
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Category', categorySchema);
