import express from 'express';
import Event from '../models/Event.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all events for logged-in organizer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching events',
      error: error.message 
    });
  }
});

// Get single event (public - for registration)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching event',
      error: error.message 
    });
  }
});

// Create event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, date, location, description } = req.body;

    if (!title || !date || !location || !description) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    const event = new Event({
      title,
      date,
      location,
      description,
      organizerId: req.user.id
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating event',
      error: error.message 
    });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizerId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found or unauthorized' 
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating event',
      error: error.message 
    });
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
      return res.status(404).json({ 
        success: false,
        message: 'Event not found or unauthorized' 
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting event',
      error: error.message 
    });
  }
});

export default router;