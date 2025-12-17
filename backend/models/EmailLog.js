import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  groupIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StakeholderGroup'
  }],
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  recipientCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('EmailLog', emailLogSchema);