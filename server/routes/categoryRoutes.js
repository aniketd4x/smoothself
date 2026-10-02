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

// Admin: Update category
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, order, isActive } = req.body;
    let category = null;

    if (isDBConnected()) {
      try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          category = await Category.findById(id);
        } else {
          category = await Category.findOne({ slug: id });
        }
        if (category) {
          if (name) category.name = name;
          if (description !== undefined) category.description = description;
          if (image !== undefined) category.image = image;
          if (order !== undefined) category.order = order;
          if (isActive !== undefined) category.isActive = isActive;
          await category.save();
        }
      } catch (e) {}
    }

    const localCat = localStore.data.categories.find(c => String(c._id) === id || c.slug === id);
    if (localCat) {
      if (name) localCat.name = name;
      if (description !== undefined) localCat.description = description;
      if (image !== undefined) localCat.image = image;
      if (order !== undefined) localCat.order = order;
      if (isActive !== undefined) localCat.isActive = isActive;
      localStore.saveData();
      if (!category) category = localCat;
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

    if (isDBConnected()) {
      try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          await Category.findByIdAndDelete(id);
        } else {
          await Category.findOneAndDelete({ slug: id });
        }
      } catch (e) {}
    }

    localStore.data.categories = localStore.data.categories.filter(c => String(c._id) !== id && c.slug !== id);
    localStore.saveData();

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
