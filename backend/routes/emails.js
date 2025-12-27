import express from 'express';
import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';
import Registration from '../models/Registration.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email to stakeholder groups
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { eventId, groupIds, subject, message } = req.body;

    if (!eventId || !groupIds || groupIds.length === 0 || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Get registrations for selected groups
    const registrations = await Registration.find({
      eventId,
      stakeholderGroupId: { $in: groupIds }
    });

    // Extract emails
    const emails = registrations
      .map(reg => reg.formData.get('Email') || reg.formData.get('email'))
      .filter(Boolean);

    // Send email if configured
    const transporter = createTransporter();
    if (transporter && emails.length > 0) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emails.join(','),
          subject,
          text: message,
          html: `<div style="font-family: Arial, sans-serif;">
            <h2>${subject}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>`
        });
        console.log(`✅ Email sent to ${emails.length} recipients`);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    // Log email
    const emailLog = new EmailLog({
      eventId,
      groupIds,
      subject,
      message,
      recipientCount: emails.length
    });
    await emailLog.save();

    res.json({
      success: true,
      message: 'Email sent successfully',
      emailsSent: emails.length
    });
  } catch (error) {
    console.error('Email route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending email',
      error: error.message 
    });
  }
});

// Get email logs for an event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const emails = await EmailLog.find({ eventId: req.params.eventId })
      .populate('groupIds')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      emails
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching email logs',
      error: error.message 
    });
  }
});

export default router;