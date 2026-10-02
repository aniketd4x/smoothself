const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const Subscriber = require('../models/Subscriber');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Public: Get general site settings
router.get('/', async (req, res) => {
  try {
    let settings = null;
    if (isDBConnected()) {
      try {
        settings = await Setting.findOne();
      } catch (e) {}
    }
    if (!settings) {
      settings = localStore.getSettings();
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update general site settings
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = null;
    if (isDBConnected()) {
      try {
        settings = await Setting.findOne();
        if (!settings) {
          settings = await Setting.create(req.body);
        } else {
          Object.assign(settings, req.body);
          await settings.save();
        }
      } catch (e) {}
    }

    const localSettings = localStore.updateSettings(req.body);

    res.json({ success: true, settings: settings || localSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }
    const cleanEmail = email.trim().toLowerCase();

    if (isDBConnected()) {
      try {
        const exists = await Subscriber.findOne({ email: cleanEmail });
        if (!exists) {
          await Subscriber.create({ email: cleanEmail });
        }
      } catch (e) {}
    }

    if (!localStore.data.subscribers) localStore.data.subscribers = [];
    if (!localStore.data.subscribers.includes(cleanEmail)) {
      localStore.data.subscribers.push(cleanEmail);
      localStore.saveData();
    }

    res.status(201).json({ success: true, message: 'Thank you for subscribing to our updates!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
