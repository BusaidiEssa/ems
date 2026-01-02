import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateData: {
    stakeholderGroups: [{
      name: String,
      fields: [{
        name: String,
        type: String,
        required: Boolean,
        options: [String]
      }]
    }],
    capacity: Number,
    waitlistEnabled: Boolean,
    registrationDeadline: Date
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Template', templateSchema);