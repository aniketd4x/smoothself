const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabaseService = require('../services/supabaseService');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'smoothself_ultra_secure_jwt_secret_key_2026';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Register customer via Supabase
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await supabaseService.createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : '',
      role: 'customer'
    });

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not complete registration' });
  }
});

// Login customer or admin via Supabase
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await supabaseService.findUserByEmail(cleanEmail);

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let isPasswordCorrect = false;
    try {
      isPasswordCorrect = bcrypt.compareSync(password, user.password);
    } catch {
      isPasswordCorrect = (user.password === password);
    }

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id || user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
});

// Admin login via Supabase
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminUser = await supabaseService.findUserByEmail(cleanEmail);

    if (!adminUser || adminUser.role !== 'admin' || !adminUser.password) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials or unauthorized' });
    }

    let isMatch = false;
    try {
      isMatch = bcrypt.compareSync(password, adminUser.password);
    } catch {
      isMatch = (adminUser.password === password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials or unauthorized' });
    }

    const token = generateToken(adminUser._id || adminUser.id);

    res.json({
      success: true,
      token,
      user: {
        id: adminUser._id || adminUser.id,
        _id: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await supabaseService.findUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile, email ID, and password (Admin & Customer) via Supabase
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, email, phone, password, currentPassword } = req.body;

    const existingUser = await supabaseService.findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found in Supabase' });
    }

    // Email validation if changing email
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }
    }

    // If changing password, verify current password
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      if (existingUser.password) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Please provide your current password to set a new password' });
        }
        let isCurrentValid = false;
        try {
          isCurrentValid = bcrypt.compareSync(currentPassword, existingUser.password);
        } catch {
          isCurrentValid = (currentPassword === existingUser.password);
        }
        if (!isCurrentValid) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
      }
    }

    const updatedUser = await supabaseService.updateUserCredentials(userId, {
      name,
      email,
      phone,
      password: password && password.trim() ? password.trim() : undefined
    });

    const newToken = generateToken(updatedUser._id || updatedUser.id);

    res.json({
      success: true,
      token: newToken,
      user: {
        id: updatedUser._id || updatedUser.id,
        _id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses || [],
        wishlist: updatedUser.wishlist || []
      },
      message: 'Profile and credentials updated successfully in Supabase!'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add address in Supabase
router.post('/addresses', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const newAddress = {
      _id: 'addr-' + Date.now(),
      name: req.body.name || req.user.name,
      phone: req.body.phone || req.user.phone,
      street: req.body.street,
      apartment: req.body.apartment || '',
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country || 'India',
      isDefault: Boolean(req.body.isDefault)
    };

    const user = await supabaseService.findUserById(userId);
    let addresses = user?.addresses || [];
    if (newAddress.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }
    addresses.push(newAddress);

    await supabaseService.updateUserAddresses(userId, addresses);
    res.status(201).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address in Supabase
router.delete('/addresses/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await supabaseService.findUserById(userId);
    let addresses = (user?.addresses || []).filter(a => String(a._id) !== req.params.id && String(a.id) !== req.params.id);

    await supabaseService.updateUserAddresses(userId, addresses);
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle wishlist in Supabase
router.post('/wishlist/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await supabaseService.findUserById(userId);
    let wishlist = [...(user?.wishlist || [])];
    let added = false;

    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
    } else {
      wishlist.push(productId);
    }

    await supabaseService.updateUserCredentials(userId, { wishlist });
    res.json({ success: true, added: idx === -1, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
