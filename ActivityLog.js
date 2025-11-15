const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'assigned', 'commented', 'status_changed', 'deleted', 'restored'],
    required: true
  },
  fieldChanged: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: String
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);