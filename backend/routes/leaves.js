const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getSupabase, newId, requireData, toDateOnly } = require('../supabase');
const { mapLeave, mapUsersById } = require('../utils/supabaseMappers');

// POST /api/leaves - employee leave request
router.post('/', protect, async (req, res) => {
  const { date, type, reason } = req.body;
  try {
    const supabase = getSupabase();
    const result = await supabase
      .from('leaves')
      .insert({ id: newId(), user_id: req.user._id, date: toDateOnly(date), type, reason })
      .select('*')
      .single();
    const leave = requireData(result.data, result.error);
    res.status(201).json(mapLeave(leave));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leaves/pending - pending leaves (admin)
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const supabase = getSupabase();
    const leaveResult = await supabase.from('leaves').select('*').eq('status', 'pending').order('date');
    const leaves = requireData(leaveResult.data, leaveResult.error);
    const userIds = [...new Set(leaves.map((leave) => leave.user_id))];
    const userResult = userIds.length
      ? await supabase.from('users').select('id,name,email,role').in('id', userIds)
      : { data: [], error: null };
    const usersById = mapUsersById(requireData(userResult.data, userResult.error));
    res.json(leaves.map((leave) => mapLeave(leave, usersById.get(leave.user_id))));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leaves/user/:userId - user-specific leaves
router.get('/user/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const supabase = getSupabase();
    const result = await supabase.from('leaves').select('*').eq('user_id', req.params.userId).order('date');
    const leaves = requireData(result.data, result.error);
    res.json(leaves.map((leave) => mapLeave(leave)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/leaves/:id - approve/reject leave
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const supabase = getSupabase();
    const result = await supabase.from('leaves').update({ status }).eq('id', req.params.id).select('*').single();
    const leave = requireData(result.data, result.error);
    res.json(mapLeave(leave));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
