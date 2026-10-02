const jwt = require('jsonwebtoken');
require('dotenv').config();
const supabaseService = require('../services/supabaseService');

const JWT_SECRET = process.env.JWT_SECRET || 'smoothself_ultra_secure_jwt_secret_key_2026';

// Protect routes - requires customer or admin login via Supabase
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await supabaseService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User session expired or user no longer exists in Supabase' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Require Admin Privileges' });
  }
};

module.exports = { protect, adminOnly };
