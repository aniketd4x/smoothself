const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Public: Get active banners
router.get('/', async (req, res) => {
  try {
    let banners = [];
    if (isDBConnected()) {
      try {
        banners = await Banner.find({ isActive: true }).sort({ order: 1 });
      } catch (e) {}
    }
    if (!banners || banners.length === 0) {
      banners = (localStore.data.banners || []).filter(b => b.isActive !== false);
    }
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all banners
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    let banners = [];
    if (isDBConnected()) {
      try {
        banners = await Banner.find().sort({ order: 1 });
      } catch (e) {}
    }
    if (!banners || banners.length === 0) {
      banners = localStore.data.banners || [];
    }
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create banner
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    let banner = null;
    if (isDBConnected()) {
      try {
        banner = await Banner.create(req.body);
      } catch (e) {}
    }
    if (!banner) {
      banner = {
        _id: 'bnr-' + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      if (!localStore.data.banners) localStore.data.banners = [];
      localStore.data.banners.push(banner);
      localStore.saveData();
    }
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update banner
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    let banner = null;
    if (isDBConnected()) {
      try {
        banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
      } catch (e) {}
    }
    if (localStore.data.banners) {
      const idx = localStore.data.banners.findIndex(b => String(b._id) === String(id));
      if (idx !== -1) {
        Object.assign(localStore.data.banners[idx], req.body);
        localStore.saveData();
        if (!banner) banner = localStore.data.banners[idx];
      }
    }
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete banner
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      try {
        await Banner.findByIdAndDelete(id);
      } catch (e) {}
    }
    if (localStore.data.banners) {
      localStore.data.banners = localStore.data.banners.filter(b => String(b._id) !== String(id));
      localStore.saveData();
    }
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
