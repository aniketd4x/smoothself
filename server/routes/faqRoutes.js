const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get active FAQs from Supabase
router.get('/', async (req, res) => {
  try {
    const faqs = await supabaseService.getFaqs(false);
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all FAQs from Supabase
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const faqs = await supabaseService.getFaqs(true);
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create FAQ in Supabase
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const faq = await supabaseService.createFaq(req.body);
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update FAQ in Supabase
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const faq = await supabaseService.updateFaq(req.params.id, req.body);
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete FAQ in Supabase
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await supabaseService.deleteFaq(req.params.id);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
