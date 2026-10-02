const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Public: Get all active FAQs
router.get('/', async (req, res) => {
  try {
    let faqs = [];
    if (isDBConnected()) {
      try {
        faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
      } catch (e) {}
    }
    if (!faqs || faqs.length === 0) {
      faqs = (localStore.data.faqs || []).filter(f => f.isActive !== false);
    }
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all FAQs
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    let faqs = [];
    if (isDBConnected()) {
      try {
        faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
      } catch (e) {}
    }
    if (!faqs || faqs.length === 0) {
      faqs = localStore.data.faqs || [];
    }
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create FAQ
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    let faq = null;
    if (isDBConnected()) {
      try {
        faq = await FAQ.create(req.body);
      } catch (e) {}
    }
    if (!faq) {
      faq = {
        _id: 'faq-' + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      if (!localStore.data.faqs) localStore.data.faqs = [];
      localStore.data.faqs.push(faq);
      localStore.saveData();
    }
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update FAQ
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    let faq = null;
    if (isDBConnected()) {
      try {
        faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
      } catch (e) {}
    }
    if (localStore.data.faqs) {
      const idx = localStore.data.faqs.findIndex(f => String(f._id) === String(id));
      if (idx !== -1) {
        Object.assign(localStore.data.faqs[idx], req.body);
        localStore.saveData();
        if (!faq) faq = localStore.data.faqs[idx];
      }
    }
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete FAQ
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      try {
        await FAQ.findByIdAndDelete(id);
      } catch (e) {}
    }
    if (localStore.data.faqs) {
      localStore.data.faqs = localStore.data.faqs.filter(f => String(f._id) !== String(id));
      localStore.saveData();
    }
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
