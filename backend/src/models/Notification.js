const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'application_received',
      'application_viewed',
      'application_shortlisted',
      'application_rejected',
      'application_interview',
      'application_offered',
      'job_published',
      'profile_viewed',
      'account_verified',
      'new_job_match',
      'system',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // extra payload (jobId, applicationId...)
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, {
  timestamps: true,
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Auto-delete old read notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
