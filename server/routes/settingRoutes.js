const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get general site settings from Supabase
router.get('/', async (req, res) => {
  try {
    const settings = await supabaseService.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update general site settings in Supabase
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const settings = await supabaseService.updateSettings(req.body);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Subscribe to newsletter via Supabase
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }
    await supabaseService.addSubscriber(email.trim().toLowerCase());
    res.status(201).json({ success: true, message: 'Thank you for subscribing to our updates!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
