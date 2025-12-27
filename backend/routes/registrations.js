import express from 'express';
import QRCode from 'qrcode';
import Registration from '../models/Registration.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get registrations for an event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ 
      eventId: req.params.eventId 
    }).populate('stakeholderGroupId');

    res.json({
      success: true,
      registrations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching registrations',
      error: error.message 
    });
  }
});

// Create registration (public)
router.post('/', async (req, res) => {
  try {
    const { eventId, stakeholderGroupId, formData } = req.body;

    if (!eventId || !stakeholderGroupId || !formData) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Generate QR code data
    const qrData = `REG-${eventId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    const registration = new Registration({
      eventId,
      stakeholderGroupId,
      formData,
      qrCode: qrCodeDataURL
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating registration',
      error: error.message 
    });
  }
});

// Toggle check-in status
router.patch('/:id/checkin', authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }

    registration.checkedIn = !registration.checkedIn;
    await registration.save();

    res.json({
      success: true,
      message: `Check-in ${registration.checkedIn ? 'completed' : 'removed'}`,
      registration
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating check-in status',
      error: error.message 
    });
  }
});

export default router;