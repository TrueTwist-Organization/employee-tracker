const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getSupabase, localDateString, newId, requireData, toDateOnly } = require('../supabase');
const { mapAttendance, mapUsersById } = require('../utils/supabaseMappers');

// POST /api/attendance - mark today's attendance (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { userId, date, status, lateMarks, timeIn: reqTimeIn, timeOut: reqTimeOut } = req.body;
  try {
    const supabase = getSupabase();
    const attendanceDate = toDateOnly(date);
    const baseDate = new Date(`${attendanceDate}T00:00:00`);

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

    const existingResult = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', attendanceDate)
      .maybeSingle();
    const existing = requireData(existingResult.data, existingResult.error);
    const payload = {
      user_id: userId,
      date: attendanceDate,
      status,
      late_marks: Number(lateMarks || 0),
      time_in: timeIn ? timeIn.toISOString() : null,
      time_out: timeOut ? timeOut.toISOString() : null,
    };
    const result = existing
      ? await supabase.from('attendance').update(payload).eq('id', existing.id).select('*').single()
      : await supabase.from('attendance').insert({ id: newId(), ...payload }).select('*').single();
    const attendance = requireData(result.data, result.error);
    res.status(201).json(mapAttendance(attendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// POST /api/attendance/self - employee self-service clock-in / clock-out
router.post('/self', protect, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { isEarlyLeave } = req.body;
    const today = localDateString();

    const existingResult = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', req.user._id)
      .eq('date', today)
      .maybeSingle();
    const existing = requireData(existingResult.data, existingResult.error);
    
    if (existing) {
      // If already clocked in, check if trying to clock out
      if (existing.time_out) {
        return res.status(400).json({ message: 'Attendance already completed for today' });
      }
      const result = await supabase
        .from('attendance')
        .update({ time_out: new Date().toISOString(), early_leave: Boolean(isEarlyLeave) })
        .eq('id', existing.id)
        .select('*')
        .single();
      const attendance = requireData(result.data, result.error);
      return res.status(200).json({
        message: isEarlyLeave ? 'Early Leave recorded' : 'Clocked out successfully',
        attendance: mapAttendance(attendance),
      });
    }

    // Clock In
    const result = await supabase
      .from('attendance')
      .insert({
        id: newId(),
        user_id: req.user._id,
        date: today,
        status: 'present',
        time_in: new Date().toISOString(),
        late_marks: 0,
      })
      .select('*')
      .single();
    const attendance = requireData(result.data, result.error);

    res.status(201).json({ message: 'Clocked in successfully', attendance: mapAttendance(attendance) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/attendance - view by month
router.get('/', protect, async (req, res) => {
  const { userId, month } = req.query; // format: YYYY-MM
  try {
    const supabase = getSupabase();
    const start = `${month}-01`;
    const endDate = new Date(`${month}-01T00:00:00`);
    endDate.setMonth(endDate.getMonth() + 1);
    const end = toDateOnly(endDate);
    
    let query = supabase.from('attendance').select('*').gte('date', start).lt('date', end).order('date');
    if (userId) query = query.eq('user_id', userId);

    const attendanceResult = await query;
    const attendance = requireData(attendanceResult.data, attendanceResult.error);
    const userIds = [...new Set(attendance.map((record) => record.user_id))];
    const userResult = userIds.length
      ? await supabase.from('users').select('id,name,email,role').in('id', userIds)
      : { data: [], error: null };
    const usersById = mapUsersById(requireData(userResult.data, userResult.error));
    res.json(attendance.map((record) => mapAttendance(record, usersById.get(record.user_id))));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
