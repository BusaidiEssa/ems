import express from 'express';
import StakeholderGroup from '../models/StakeholderGroup.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all stakeholder groups for an event (public for registration)
router.get('/event/:eventId', async (req, res) => {
  try {
    const groups = await StakeholderGroup.find({ 
      eventId: req.params.eventId 
    });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching groups',
      error: error.message 
    });
  }
});

// Create stakeholder group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, name, fields } = req.body;

    if (!eventId || !name || !fields || fields.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Event ID, name, and fields are required' 
      });
    }

    const group = new StakeholderGroup({
      eventId,
      name,
      fields
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Stakeholder group created successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating group',
      error: error.message 
    });
  }
});

// Update stakeholder group
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const group = await StakeholderGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    res.json({
      success: true,
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating group',
      error: error.message 
    });
  }
});

// Delete stakeholder group
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const group = await StakeholderGroup.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting group',
      error: error.message 
    });
  }
});

export default router;