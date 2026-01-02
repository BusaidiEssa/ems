import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Event from '../models/Event.js';
import User from '../models/User.js';
import TeamInvitation from '../models/TeamInvitation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get team members for event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('teamMembers.userId', 'name email');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get pending invitations
    const invitations = await TeamInvitation.find({ 
      eventId: req.params.eventId, 
      status: 'pending' 
    });

    res.json({ 
      success: true, 
      teamMembers: event.teamMembers,
      pendingInvitations: invitations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching team', error: error.message });
  }
});

// Invite team member
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { eventId, email, role } = req.body;

    if (!eventId || !email || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user is owner or editor
    const event = await Event.findOne({
      _id: eventId,
      $or: [
        { organizerId: req.user.id },
        { 'teamMembers': { $elemMatch: { userId: req.user.id, role: { $in: ['owner', 'editor'] } } } }
      ]
    });

    if (!event) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    const invitation = new TeamInvitation({
      eventId,
      invitedBy: req.user.id,
      email,
      role,
      token
    });

    await invitation.save();

    // Send invitation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const inviteLink = `${process.env.FRONTEND_URL}/team/accept/${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Team Invitation for ${event.title}`,
      html: `
        <h2>You've been invited to join the team!</h2>
        <p>You've been invited to collaborate on <strong>${event.title}</strong> as a <strong>${role}</strong>.</p>
        <p>Role permissions:</p>
        <ul>
          <li><strong>Editor:</strong> Can edit event details, manage registrations, and view analytics</li>
          <li><strong>Viewer:</strong> Can view event details and registrations (read-only)</li>
        </ul>
        <p><a href="${inviteLink}">Click here to accept the invitation</a></p>
        <p>This invitation expires in 7 days.</p>
      `
    });

    res.json({ success: true, message: 'Invitation sent successfully', invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending invitation', error: error.message });
  }
});

// Accept invitation
router.post('/accept/:token', authenticateToken, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({ 
      token: req.params.token,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found or expired' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invitation has expired' });
    }

    const user = await User.findById(req.user.id);
    if (user.email !== invitation.email) {
      return res.status(403).json({ success: false, message: 'This invitation is for a different email' });
    }

    // Add user to team
    const event = await Event.findById(invitation.eventId);
    event.teamMembers.push({
      userId: req.user.id,
      role: invitation.role
    });
    await event.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.json({ success: true, message: 'Invitation accepted', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error accepting invitation', error: error.message });
  }
});

// Remove team member
router.delete('/event/:eventId/member/:userId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.eventId,
      organizerId: req.user.id // Only owner can remove members
    });

    if (!event) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    event.teamMembers = event.teamMembers.filter(
      m => m.userId.toString() !== req.params.userId
    );
    await event.save();

    res.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing member', error: error.message });
  }
});

export default router;