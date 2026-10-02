const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get active banners from Supabase
router.get('/', async (req, res) => {
  try {
    const banners = await supabaseService.getBanners(false);
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all banners from Supabase
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const banners = await supabaseService.getBanners(true);
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create banner in Supabase
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const banner = await supabaseService.createBanner(req.body);
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update banner in Supabase
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const banner = await supabaseService.updateBanner(req.params.id, req.body);
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete banner in Supabase
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await supabaseService.deleteBanner(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
