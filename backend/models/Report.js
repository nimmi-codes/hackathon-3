const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boarding: { type: mongoose.Schema.Types.ObjectId, ref: 'Boarding' },
    type: { type: String, enum: ['wrong_info', 'already_full', 'scam'], required: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
