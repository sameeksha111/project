const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    default: () => 'CASE-' + Date.now()
  },
  
  // Owner Information
  ownerName: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  ownerEmail: String,
  ownerAddress: {
    type: String,
    required: true
  },
  
  // Pet Information
  petName: {
    type: String,
    required: true
  },
  petSpecies: {
    type: String,
    enum: ['dogs', 'cats', 'wildlife', 'other'],
    required: true
  },
  petBreed: String,
  petAge: String,
  petColor: String,
  
  // Case Details
  issueType: {
    type: String,
    enum: ['missing', 'injured', 'illness', 'lost-found', 'general', 'emergency'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Audio/Voicemail
  voicemailUrl: String,
  voicemailTranscript: String,
  
  // Priority & Status
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Source & Assignment
  source: {
    type: String,
    enum: ['voicemail', 'in-person', 'manual'],
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  
  // Tags
  tags: [String],
  
  // Location for mapping
  location: {
    city: String,
    state: String,
    latitude: Number,
    longitude: Number
  }
});

// Index for duplicate detection
caseSchema.index({ ownerPhone: 1 });
caseSchema.index({ petName: 1 });
caseSchema.index({ createdAt: -1 });
caseSchema.index({ status: 1, priority: 1 });
caseSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Case', caseSchema);