import express from 'express';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import StakeholderGroup from '../models/StakeholderGroup.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
//            EMAIL TRANSPORTER
// 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email not configured');
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

// 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
//            GET REGISTRATIONS
// 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
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
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching registrations',
      error: error.message 
    });
  }
});

// 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
// CREATE REGISTRATION - WITH CHECKBOX SUPPORT
// 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
router.post('/', async (req, res) => {
  try {
    console.log('📥 Registration request');
    const { eventId, stakeholderGroupId, formData } = req.body;

    if (!eventId || !stakeholderGroupId || !formData) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing fields' 
      });
    }

    console.log('📊 Fetching event and group...');
    const [event, group] = await Promise.all([
      Event.findById(eventId),
      StakeholderGroup.findById(stakeholderGroupId)
    ]);

    if (!event || !group) {
      return res.status(404).json({
        success: false,
        message: 'Event or group not found'
      });
    }

    console.log('✅ Event:', event.title);
    console.log('✅ Group:', group.name);

    

    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    //  CONVERT ARRAY VALUES TO JSON STRINGS FOR STORAGE
    //  (For checkbox fields that return arrays)
    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    const processedFormData = {};
    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value)) {
        // Convert array to JSON string for storage in Map
        processedFormData[key] = JSON.stringify(value);
      } else {
        processedFormData[key] = String(value || '');
      }
    }

    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    //     SAVE REGISTRATION FIRST TO GET ID
    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    console.log('💾 Creating registration...');
    
    // Create plain object for formData Map
    const formDataEntries = Object.entries(processedFormData);
    
    const registration = new Registration({
      eventId,
      stakeholderGroupId,
      formData: formDataEntries.reduce((map, [key, value]) => {
        map.set(key, value);
        return map;
      }, new Map()),
      qrCode: '', // Temporary, will update
      checkedIn: false
    });

    const savedRegistration = await registration.save();
    console.log('✅ Registration saved:', savedRegistration._id);

    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    // GENERATE QR CODE WITH REGISTRATION ID
    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    console.log('🔲 Generating unique QR code...');
    const qrData = JSON.stringify({
      registrationId: savedRegistration._id.toString(),
      eventId: eventId,
      participantName: formData.Name || formData.name,
      timestamp: Date.now()
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, { 
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Update registration with QR code
    savedRegistration.qrCode = qrCodeDataURL;
    await savedRegistration.save();
    console.log('✅ QR code generated with registration ID');

    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    //                SEND EMAIL
    // 🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺🐺
    const transporter = createTransporter();
    const participantEmail = formData.Email || formData.email;
    const participantName = formData.Name || formData.name || 'Participant';

    console.log('📧 Email:', participantEmail);

    if (transporter && participantEmail) {
      try {
        console.log('📤 Sending email...');
        
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: participantEmail,
          subject: `✅ Registration Confirmed - ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
              </div>
              
              <div style="padding: 30px; background: white;">
                <h2 style="color: #333;">Hello ${participantName}!</h2>
                <p style="color: #666;">Thank you for registering for <strong>${event.title}</strong>!</p>
                
                <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <h3 style="margin-top: 0; color: #667eea;">📅 Event Details</h3>
                  <p><strong>Event:</strong> ${event.title}</p>
                  <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> ${event.location}</p>
                  <p><strong>Type:</strong> ${group.name}</p>
                </div>

                <div style="text-align: center; padding: 30px; background: #f9f9f9; margin: 20px 0; border-radius: 10px;">
                  <h3 style="color: #667eea;">Your Unique Check-in QR Code</h3>
                  <p style="color: #666; margin-bottom: 15px;">Your personal QR code is attached</p>
                  <img src="cid:qrcode" alt="QR Code" style="max-width: 250px; border: 4px solid #667eea; border-radius: 10px; padding: 10px; background: white;" />
                  <p style="color: #999; font-size: 12px; margin-top: 10px;">Registration ID: ${savedRegistration._id}</p>
                </div>

                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> This QR code is unique to you. Save it and show it at check-in.</p>
                </div>

                <p style="color: #667eea; font-weight: bold;">We look forward to seeing you!</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px;">
                <p>&copy; ${new Date().getFullYear()} Event Management System</p>
              </div>
            </div>
          `,
          attachments: [{
            filename: `event-qr-${savedRegistration._id}.png`,
            content: base64Data,
            encoding: 'base64',
            cid: 'qrcode'
          }]
        });

        console.log('✅ Email sent to:', participantEmail);
      } catch (emailError) {
        console.error('❌ Email error:', emailError.message);
      }
    }

    console.log('✅ Sending success response');
    
    // ✅ Parse back any JSON strings when sending response
    const responseFormData = {};
    for (const [key, value] of savedRegistration.formData.entries()) {
      try {
        responseFormData[key] = JSON.parse(value);
      } catch {
        responseFormData[key] = value;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      registration: {
        _id: savedRegistration._id,
        qrCode: savedRegistration.qrCode,
        formData: responseFormData,
        checkedIn: savedRegistration.checkedIn
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message 
    });
  }
});
router.delete('/:id', authenticateToken, async (req, res) => {
      try {
        const registration = await Registration.findOneAndDelete({
          _id: req.params.id
        });

        if (!registration) {
          return res.status(404).json({ 
            success: false,
            message: 'Registration not found' 
          });
        }

        res.json({
          success: true,
          message: 'Registration deleted successfully'
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          message: 'Error deleting registration',
          error: error.message 
        });
      }
    });
// ============================================
// TOGGLE CHECK-IN
// ============================================
router.patch('/:id/checkin', authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Not found' 
      });
    }

    registration.checkedIn = !registration.checkedIn;
    await registration.save();

    res.json({
      success: true,
      message: `Check-in ${registration.checkedIn ? 'successful' : 'removed'}`,
      registration: {
        ...registration.toObject(),
        formData: Object.fromEntries(registration.formData)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Check-in failed',
      error: error.message 
    });
  }
});

export default router;