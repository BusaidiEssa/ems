import express from 'express';
import Template from '../models/Template.js';
import StakeholderGroup from '../models/StakeholderGroup.js';
import Event from '../models/Event.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all templates for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await Template.find({ organizerId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching templates',
      error: error.message 
    });
  }
});

// Create template from current event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, eventId } = req.body;

    if (!name || !eventId) {
      return res.status(400).json({ 
        success: false,
        message: 'Template name and event ID are required' 
      });
    }

    // Get event
    const event = await Event.findOne({ 
      _id: eventId, 
      organizerId: req.user.id 
    });

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found or unauthorized' 
      });
    }

    // Get stakeholder groups for this event
    const groups = await StakeholderGroup.find({ eventId });

    // Create template data
    const templateData = {
      stakeholderGroups: groups.map(group => ({
        name: group.name,
        fields: group.fields.map(field => ({
          name: field.name,
          type: field.type,
          required: field.required,
          options: field.options || []
        }))
      })),
      capacity: event.capacity,
      waitlistEnabled: event.waitlistEnabled,
      registrationDeadline: event.registrationDeadline
    };

    const template = new Template({
      name,
      organizerId: req.user.id,
      templateData,
      usageCount: 0
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating template',
      error: error.message 
    });
  }
});

// Apply template to event
router.post('/:templateId/apply', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ 
        success: false,
        message: 'Event ID is required' 
      });
    }

    // Get template
    const template = await Template.findOne({
      _id: templateId,
      organizerId: req.user.id
    });

    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Template not found or unauthorized' 
      });
    }

    // Get event
    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user.id
    });

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found or unauthorized' 
      });
    }

    // Delete existing stakeholder groups for this event
    await StakeholderGroup.deleteMany({ eventId });

    // Create new stakeholder groups from template
    const groupPromises = template.templateData.stakeholderGroups.map(groupData => {
      const group = new StakeholderGroup({
        eventId,
        name: groupData.name,
        fields: groupData.fields
      });
      return group.save();
    });

    await Promise.all(groupPromises);

    // Update event capacity settings
    event.capacity = template.templateData.capacity;
    event.waitlistEnabled = template.templateData.waitlistEnabled;
    event.registrationDeadline = template.templateData.registrationDeadline;
    await event.save();

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    res.json({
      success: true,
      message: 'Template applied successfully',
      event
    });
  } catch (error) {
    console.error('Template apply error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error applying template',
      error: error.message 
    });
  }
});

// Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      organizerId: req.user.id
    });

    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Template not found or unauthorized' 
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting template',
      error: error.message 
    });
  }
});

export default router;