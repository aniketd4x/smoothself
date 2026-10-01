const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const Subscriber = require('../models/Subscriber');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get general site settings
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update general site settings
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const exists = await Subscriber.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.json({ success: true, message: 'You are already subscribed to our newsletter' });
    }

    await Subscriber.create({ email: email.toLowerCase() });
    res.status(201).json({ success: true, message: 'Thank you for subscribing to our updates!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all subscribers
router.get('/subscribers', protect, adminOnly, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
