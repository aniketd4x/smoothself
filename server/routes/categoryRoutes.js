const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Get all active categories (public)
router.get('/', async (req, res) => {
  try {
    let categories = [];
    if (isDBConnected()) {
      try {
        categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      } catch (e) {}
    }
    if (!categories || categories.length === 0) {
      categories = localStore.getCategories();
    }
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all categories including inactive
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    let categories = [];
    if (isDBConnected()) {
      try {
        categories = await Category.find().sort({ order: 1, name: 1 });
      } catch (e) {}
    }
    if (!categories || categories.length === 0) {
      categories = localStore.data.categories;
    }
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create category
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, image, order, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let category = null;
    if (isDBConnected()) {
      try {
        category = await Category.create({
          name,
          slug,
          description,
          image,
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true
        });
      } catch (e) {}
    }

    const localCat = {
      _id: 'cat-' + Date.now(),
      name,
      slug,
      description: description || '',
      image: image || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    };
    localStore.data.categories.push(localCat);
    localStore.saveData();

    res.status(201).json({ success: true, category: category || localCat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
