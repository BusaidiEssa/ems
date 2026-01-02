// backend/routes/events.js - UPDATED with capacity management
import express from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all events for logged-in organizer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ 
      $or: [
        { organizerId: req.user.id },
        { 'teamMembers.userId': req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    // Add capacity info to each event
    const eventsWithCapacity = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({ eventId: event._id });
        return {
          ...event.toObject(),
          currentRegistrations: registrationCount,
          availableSpots: event.capacity ? event.capacity - registrationCount : null,
          isAtCapacity: event.capacity ? registrationCount >= event.capacity : false
        };
      })
    );
    
    res.json({ success: true, events: eventsWithCapacity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
});

// Get single event (public - for registration)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check capacity and deadline
    const registrationCount = await Registration.countDocuments({ eventId: event._id });
    const isAtCapacity = await event.isAtCapacity();
    const isRegistrationClosed = event.isRegistrationClosed();

    res.json({
      success: true,
      event: {
        ...event.toObject(),
        currentRegistrations: registrationCount,
        availableSpots: event.capacity ? event.capacity - registrationCount : null,
        isAtCapacity,
        isRegistrationClosed,
        canRegister: !isAtCapacity && !isRegistrationClosed && event.status === 'published'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
});

// Create event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, date, location, description, capacity, waitlistEnabled, registrationDeadline, status } = req.body;

    if (!title || !date || !location || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const event = new Event({
      title,
      date,
      location,
      description,
      capacity: capacity || null,
      waitlistEnabled: waitlistEnabled || false,
      registrationDeadline: registrationDeadline || null,
      status: status || 'published',
      organizerId: req.user.id,
      teamMembers: [{
        userId: req.user.id,
        role: 'owner'
      }]
    });

    await event.save();
    res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id,
      $or: [
        { organizerId: req.user.id },
        { 'teamMembers': { $elemMatch: { userId: req.user.id, role: { $in: ['owner', 'editor'] } } } }
      ]
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id, 
      organizerId: req.user.id 
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
  }
});

export default router;