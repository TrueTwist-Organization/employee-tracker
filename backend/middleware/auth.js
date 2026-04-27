const jwt = require('jsonwebtoken');
const { getSupabase, requireData } = require('../supabase');
const { mapUser } = require('../utils/supabaseMappers');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const supabase = getSupabase();
      const result = await supabase
        .from('users')
        .select('id,name,email,role')
        .eq('id', decoded.id)
        .maybeSingle();
      const user = requireData(result.data, result.error);
      req.user = mapUser(user);
      if (!req.user) {
        return res.status(401).json({ message: 'Session expired or user deleted. Please log out and log in again.' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, Admin only' });
  }
};

module.exports = { protect, adminOnly };
