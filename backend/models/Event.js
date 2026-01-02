import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // NEW: Event Capacity Management (3.1)
  capacity: {
    type: Number,
    default: null // null = unlimited
  },
  waitlistEnabled: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  // NEW: Team Management (3.8)
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Check if event is at capacity
eventSchema.methods.isAtCapacity = async function() {
  if (!this.capacity) return false;
  
  const Registration = mongoose.model('Registration');
  const count = await Registration.countDocuments({ eventId: this._id });
  return count >= this.capacity;
};

// Check if registration deadline passed
eventSchema.methods.isRegistrationClosed = function() {
  if (!this.registrationDeadline) return false;
  return new Date() > this.registrationDeadline;
};

export default mongoose.model('Event', eventSchema);