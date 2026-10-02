const express = require('express');
const router = express.Router();
const User = require('../models/User');
const localStore = require('../data/localStore');
const { protect, generateToken } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register customer
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

    let user = null;

    if (isDBConnected()) {
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
          return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }

        const createdUser = await User.create({
          name: name.trim(),
          email: cleanEmail,
          password,
          phone: phone ? phone.trim() : '',
          role: 'customer'
        });

        user = {
          _id: createdUser._id,
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          phone: createdUser.phone,
          addresses: createdUser.addresses || [],
          wishlist: createdUser.wishlist || []
        };
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }
        console.warn('[Register Fallback]', dbErr.message);
      }
    }

    // If DB is offline or failed, use localStore
    if (!user) {
      const existingLocal = localStore.findUserByEmail(cleanEmail);
      if (existingLocal) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const createdLocal = localStore.createUser({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone ? phone.trim() : '',
        role: 'customer'
      });

      user = {
        _id: createdLocal._id,
        id: createdLocal._id,
        name: createdLocal.name,
        email: createdLocal.email,
        role: createdLocal.role,
        phone: createdLocal.phone,
        addresses: createdLocal.addresses || [],
        wishlist: createdLocal.wishlist || []
      };
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(400).json({ success: false, message: error.message || 'Could not complete registration' });
  }
});

// Login customer or admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;
    let isPasswordCorrect = false;

    // 1. Try DB
    if (isDBConnected()) {
      try {
        const dbUser = await User.findOne({ email: cleanEmail }).select('+password');
        if (dbUser) {
          isPasswordCorrect = await dbUser.matchPassword(password);
          if (isPasswordCorrect) {
            user = {
              _id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
              phone: dbUser.phone,
              addresses: dbUser.addresses || [],
              wishlist: dbUser.wishlist || []
            };
          }
        }
      } catch (dbErr) {
        console.warn('[Login DB Notice]', dbErr.message);
      }
    }

    // 2. Try localStore if not authenticated yet
    if (!user) {
      const localUser = localStore.findUserByEmail(cleanEmail);
      if (localUser) {
        isPasswordCorrect = localStore.matchPassword(password, localUser.password);
        if (isPasswordCorrect) {
          user = {
            _id: localUser._id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role,
            phone: localUser.phone,
            addresses: localUser.addresses || [],
            wishlist: localUser.wishlist || []
          };
        }
      }
    }

    if (!user || !isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
});

// Admin specific login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let adminUser = null;
    let isMatch = false;

    if (isDBConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail }).select('+password');
        if (user && user.role === 'admin') {
          isMatch = await user.matchPassword(password);
          if (isMatch) adminUser = user;
        }
      } catch (e) {}
    }

    if (!adminUser) {
      const localAdmin = localStore.findUserByEmail(cleanEmail);
      if (localAdmin && localAdmin.role === 'admin') {
        isMatch = localStore.matchPassword(password, localAdmin.password);
        if (isMatch) adminUser = localAdmin;
      }
    }

    if (!adminUser || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials or unauthorized' });
    }

    const token = generateToken(adminUser._id);

    res.json({
      success: true,
      token,
      user: {
        id: adminUser._id,
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
    let user = null;
    if (isDBConnected()) {
      try {
        user = await User.findById(req.user._id || req.user.id).populate('wishlist');
      } catch (e) {}
    }
    if (!user) {
      user = localStore.findUserById(req.user._id || req.user.id);
    }

    res.json({
      success: true,
      user: user || req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let updated = null;

    if (isDBConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.name = req.body.name || user.name;
          user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
          if (req.body.password) user.password = req.body.password;
          await user.save();
          updated = user;
        }
      } catch (e) {}
    }

    const localUpdated = localStore.updateUser(userId, {
      name: req.body.name,
      phone: req.body.phone,
      password: req.body.password
    });

    const finalUser = updated || localUpdated || req.user;

    res.json({
      success: true,
      user: {
        id: finalUser._id,
        name: finalUser.name,
        email: finalUser.email,
        role: finalUser.role,
        phone: finalUser.phone,
        addresses: finalUser.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add address
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

    let addresses = [];

    if (isDBConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (newAddress.isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
          }
          user.addresses.push(newAddress);
          await user.save();
          addresses = user.addresses;
        }
      } catch (e) {}
    }

    const localUser = localStore.findUserById(userId);
    if (localUser) {
      if (!localUser.addresses) localUser.addresses = [];
      if (newAddress.isDefault) {
        localUser.addresses.forEach(a => a.isDefault = false);
      }
      localUser.addresses.push(newAddress);
      localStore.saveData();
      if (!addresses.length) addresses = localUser.addresses;
    }

    res.status(201).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address
router.delete('/addresses/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let addresses = [];

    if (isDBConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.addresses = user.addresses.filter(a => String(a._id) !== req.params.id);
          await user.save();
          addresses = user.addresses;
        }
      } catch (e) {}
    }

    const localUser = localStore.findUserById(userId);
    if (localUser && localUser.addresses) {
      localUser.addresses = localUser.addresses.filter(a => String(a._id) !== req.params.id);
      localStore.saveData();
      if (!addresses.length) addresses = localUser.addresses;
    }

    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle wishlist
router.post('/wishlist/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id || req.user.id;
    let added = false;
    let wishlist = [];

    if (isDBConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          const index = user.wishlist.indexOf(productId);
          if (index > -1) {
            user.wishlist.splice(index, 1);
          } else {
            user.wishlist.push(productId);
            added = true;
          }
          await user.save();
          wishlist = user.wishlist;
        }
      } catch (e) {}
    }

    const localUser = localStore.findUserById(userId);
    if (localUser) {
      if (!localUser.wishlist) localUser.wishlist = [];
      const idx = localUser.wishlist.indexOf(productId);
      if (idx > -1) {
        localUser.wishlist.splice(idx, 1);
      } else {
        localUser.wishlist.push(productId);
        added = true;
      }
      localStore.saveData();
      if (!wishlist.length) wishlist = localUser.wishlist;
    }

    res.json({ success: true, added, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
