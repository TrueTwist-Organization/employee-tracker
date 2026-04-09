const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Leave = require('../models/Leave');

// POST /api/leaves - employee leave request
router.post('/', protect, async (req, res) => {
  const { date, type, reason } = req.body;
  try {
    const leave = await Leave.create({ userId: req.user._id, date, type, reason });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leaves/pending - pending leaves (admin)
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' }).populate('userId', 'name role email');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leaves/user/:userId - user-specific leaves
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.userId });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/leaves/:id - approve/reject leave
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
