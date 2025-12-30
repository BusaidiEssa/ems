import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  stakeholderGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StakeholderGroup',
    required: true
  },
  formData: {
    type: Map,
    of: String,
    default: () => new Map()
  },
  qrCode: {
    type: String,
    default: ''
  },
  checkedIn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Registration', registrationSchema);