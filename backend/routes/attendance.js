const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// POST /api/attendance - mark today's attendance (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { userId, date, status, lateMarks, timeIn: reqTimeIn, timeOut: reqTimeOut } = req.body;
  try {
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    let timeIn = null;
    let timeOut = null;
    
    if (status === 'present') {
        timeIn = new Date(baseDate);
        if (reqTimeIn) {
            const [h, m] = reqTimeIn.split(':');
            timeIn.setHours(parseInt(h), parseInt(m), 0, 0);
        } else {
            timeIn.setHours(9, 30, 0, 0); // 9:30 AM
        }
        
        timeOut = new Date(baseDate);
        if (reqTimeOut) {
            const [h, m] = reqTimeOut.split(':');
            timeOut.setHours(parseInt(h), parseInt(m), 0, 0);
        } else {
            timeOut.setHours(18, 30, 0, 0); // 6:30 PM
        }
    }

    const attendance = await Attendance.findOneAndUpdate(
      { userId, date: baseDate },
      { userId, date: baseDate, status, lateMarks: lateMarks || 0, timeIn, timeOut },
      { upsert: true, new: true }
    );
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// POST /api/attendance/self - employee self-service clock-in / clock-out
router.post('/self', protect, async (req, res) => {
  try {
    const { isEarlyLeave } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    
    if (existing) {
      // If already clocked in, check if trying to clock out
      if (existing.timeOut) {
        return res.status(400).json({ message: 'Attendance already completed for today' });
      }
      // Set Clock Out Time
      existing.timeOut = new Date();
      if (isEarlyLeave) {
         existing.earlyLeave = true;
      }
      await existing.save();
      return res.status(200).json({ message: isEarlyLeave ? 'Early Leave recorded' : 'Clocked out successfully', attendance: existing });
    }

    // Clock In
    const attendance = await Attendance.create({
       userId: req.user._id,
       date: today,
       status: 'present',
       timeIn: new Date(),
       lateMarks: 0
    });

    res.status(201).json({ message: 'Clocked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/attendance - view by month
router.get('/', protect, async (req, res) => {
  const { userId, month } = req.query; // format: YYYY-MM
  try {
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
    
    // Filter by userId if provided, otherwise for all (admin view)
    const query = { date: { $gte: start, $lt: end } };
    if (userId) query.userId = userId;

    const data = await Attendance.find(query).populate('userId', 'name');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
