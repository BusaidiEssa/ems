import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'tel', 'textarea', 'checkbox', 'date', 'time', 'select', 'radio']
  },
  required: {
    type: Boolean,
    default: false
  },
  options: {
    type: [String],  //  ADDED: Array of strings for dropdown/radio/checkbox options
    default: []
  }
});

const stakeholderGroupSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  fields: [fieldSchema]
}, {
  timestamps: true
});

export default mongoose.model('StakeholderGroup', stakeholderGroupSchema);