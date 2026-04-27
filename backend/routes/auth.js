const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSupabase, newId, requireData } = require('../supabase');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const supabase = getSupabase();
    const existingResult = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    const userExists = requireData(existingResult.data, existingResult.error);
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await supabase
      .from('users')
      .insert({ id: newId(), name, email, password: hashedPassword, role: role || 'employee' })
      .select('id,name,email,role')
      .single();
    const user = requireData(result.data, result.error);
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const supabase = getSupabase();
    const result = await supabase.from('users').select('id,name,email,role,password').eq('email', email).maybeSingle();
    const user = requireData(result.data, result.error);
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/me - update the logged-in user's email/password
router.put('/me', protect, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: 'Current password is required' });
  }

  if (newPassword && newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  try {
    const supabase = getSupabase();
    const currentResult = await supabase
      .from('users')
      .select('id,name,email,role,password')
      .eq('id', req.user._id)
      .single();
    const currentUser = requireData(currentResult.data, currentResult.error);

    const passwordMatches = await bcrypt.compare(currentPassword, currentUser.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (email && email.trim() && email.trim() !== currentUser.email) {
      const existingResult = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();
      const existingUser = requireData(existingResult.data, existingResult.error);
      if (existingUser && existingUser.id !== currentUser.id) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      updates.email = email.trim();
    }
    if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);

    if (!Object.keys(updates).length) {
      return res.json({
        _id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        token: generateToken(currentUser.id),
      });
    }

    const updateResult = await supabase
      .from('users')
      .update(updates)
      .eq('id', currentUser.id)
      .select('id,name,email,role')
      .single();
    const updatedUser = requireData(updateResult.data, updateResult.error);

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
