import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get all organizers
router.get('/organizers', async (req, res) => {
  try {
    const organizers = await User.find({ 
      role: { $in: ['organizer', 'admin'] } 
    }).select('-password');
    
    // Get event counts for each organizer
    const organizersWithStats = await Promise.all(
      organizers.map(async (org) => {
        const eventCount = await Event.countDocuments({ organizerId: org._id });
        const events = await Event.find({ organizerId: org._id });
        const eventIds = events.map(e => e._id);
        const registrationCount = await Registration.countDocuments({ 
          eventId: { $in: eventIds } 
        });
        
        return {
          ...org.toObject(),
          stats: {
            totalEvents: eventCount,
            totalRegistrations: registrationCount
          }
        };
      })
    );
    
    res.json({ success: true, organizers: organizersWithStats });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching organizers', 
      error: error.message 
    });
  }
});

// Get all events (across all organizers)
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizerId', 'name email')
      .sort({ createdAt: -1 });
    
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({ 
          eventId: event._id 
        });
        return {
          ...event.toObject(),
          registrationCount
        };
      })
    );
    
    res.json({ success: true, events: eventsWithStats });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events', 
      error: error.message 
    });
  }
});

// Suspend/Activate organizer
router.patch('/organizers/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'suspended'}`,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user', 
      error: error.message 
    });
  }
});

// Delete event (admin override)
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Also delete associated registrations
    await Registration.deleteMany({ eventId: req.params.id });
    
    res.json({ success: true, message: 'Event and registrations deleted' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting event', 
      error: error.message 
    });
  }
});

// System-wide statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalRegistrations] = await Promise.all([
      User.countDocuments({ role: { $in: ['organizer', 'admin'] } }),
      Event.countDocuments(),
      Registration.countDocuments()
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        avgRegistrationsPerEvent: totalEvents > 0 
          ? (totalRegistrations / totalEvents).toFixed(1) 
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
});

export default router;