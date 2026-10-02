const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get all published blogs from Supabase
router.get('/', async (req, res) => {
  try {
    const posts = await supabaseService.getBlogs(false);
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all blogs from Supabase
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const posts = await supabaseService.getBlogs(true);
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get single blog post by slug from Supabase
router.get('/:slug', async (req, res) => {
  try {
    const post = await supabaseService.getBlogBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create blog post in Supabase
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const post = await supabaseService.createBlog(req.body);
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update blog post in Supabase
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await supabaseService.updateBlog(req.params.id, req.body);
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete blog post in Supabase
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await supabaseService.deleteBlog(req.params.id);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
