import express from 'express';
import Registration from '../models/Registration.js';
import StakeholderGroup from '../models/StakeholderGroup.js';
import AnalyticsSnapshot from '../models/AnalyticsSnapshot.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get real-time analytics for event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId });
    const groups = await StakeholderGroup.find({ eventId: req.params.eventId });

    const totalRegistrations = registrations.length;
    const checkedIn = registrations.filter(r => r.checkedIn).length;
    const pending = totalRegistrations - checkedIn;
    const checkInRate = totalRegistrations > 0 ? ((checkedIn / totalRegistrations) * 100).toFixed(1) : 0;

    // Group statistics
    const registrationsByGroup = groups.map(group => {
      const count = registrations.filter(r => r.stakeholderGroupId.toString() === group._id.toString()).length;
      const checkedInCount = registrations.filter(
        r => r.stakeholderGroupId.toString() === group._id.toString() && r.checkedIn
      ).length;
      return {
        groupId: group._id,
        groupName: group.name,
        total: count,
        checkedIn: checkedInCount,
        percentage: totalRegistrations > 0 ? ((count / totalRegistrations) * 100).toFixed(1) : 0
      };
    });

    // Daily trend (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const dailyRegistrations = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = registrations.filter(r => {
        const regDate = new Date(r.createdAt);
        return regDate >= date && regDate < nextDay;
      }).length;

      return { 
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        count 
      };
    });

    // Hourly registration pattern
    const registrationsByHour = Array.from({ length: 24 }, (_, hour) => {
      const count = registrations.filter(r => {
        const regHour = new Date(r.createdAt).getHours();
        return regHour === hour;
      }).length;
      return { hour, count };
    });

    const peakHour = registrationsByHour.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    , { hour: 0, count: 0 });

    // Average check-in time (in minutes from registration)
    const checkInTimes = registrations
      .filter(r => r.checkedIn && r.updatedAt && r.createdAt)
      .map(r => (new Date(r.updatedAt) - new Date(r.createdAt)) / (1000 * 60));
    
    const averageCheckInTime = checkInTimes.length > 0 
      ? (checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      analytics: {
        summary: {
          totalRegistrations,
          checkedIn,
          pending,
          checkInRate
        },
        registrationsByGroup,
        dailyTrend: dailyRegistrations,
        registrationsByHour,
        peakRegistrationHour: peakHour.hour,
        averageCheckInTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
});

// Create analytics snapshot (for historical data)
router.post('/snapshot/:eventId', authenticateToken, async (req, res) => {
  try {
    const { analytics } = await fetch(`${req.protocol}://${req.get('host')}/api/analytics/event/${req.params.eventId}`).then(r => r.json());

    const snapshot = new AnalyticsSnapshot({
      eventId: req.params.eventId,
      metrics: {
        totalRegistrations: analytics.summary.totalRegistrations,
        checkedIn: analytics.summary.checkedIn,
        pending: analytics.summary.pending,
        checkInRate: analytics.summary.checkInRate,
        registrationsByGroup: analytics.registrationsByGroup,
        registrationsByHour: analytics.registrationsByHour,
        averageCheckInTime: analytics.averageCheckInTime,
        peakRegistrationHour: analytics.peakRegistrationHour
      }
    });

    await snapshot.save();
    res.json({ success: true, message: 'Snapshot created', snapshot });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating snapshot', error: error.message });
  }
});

export default router;