const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },

  coverLetter: {
    type: String,
    maxlength: 3000,
  },

  cv: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date,
  },

  status: {
    type: String,
    enum: ['pending', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
    default: 'pending',
  },

  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],

  interviewDate: Date,
  interviewLocation: String,
  interviewNote: String,

  companyNote: { type: String, select: false }, // internal note, hidden from student
  rating: { type: Number, min: 1, max: 5 }, // internal company rating

  isRead: { type: Boolean, default: false },
  readAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// One application per student per job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
