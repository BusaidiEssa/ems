import mongoose from 'mongoose';

const analyticsSnapshotSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  metrics: {
    totalRegistrations: Number,
    checkedIn: Number,
    pending: Number,
    checkInRate: Number,
    registrationsByGroup: [{
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StakeholderGroup'
      },
      count: Number
    }],
    registrationsByHour: [{
      hour: Number,
      count: Number
    }],
    averageCheckInTime: Number, // in minutes from registration
    peakRegistrationHour: Number
  }
}, {
  timestamps: true
});

// Create index for efficient querying
analyticsSnapshotSchema.index({ eventId: 1, date: -1 });

export default mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);