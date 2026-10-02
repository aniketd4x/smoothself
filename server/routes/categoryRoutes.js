const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await supabaseService.getCategories(false);
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all categories including inactive
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const categories = await supabaseService.getCategories(true);
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create category
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const category = await supabaseService.createCategory(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update category
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await supabaseService.updateCategory(id, req.body);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete category
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteCategory(id);
    res.json({ success: true, message: 'Category deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
