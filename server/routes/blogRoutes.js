const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true }).sort({ publishedAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all posts
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ publishedAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create blog post
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, author, tags, published } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    
    const post = await BlogPost.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || '',
      author: author || 'Botanical Science Team',
      tags: tags || [],
      published: published !== undefined ? published : true
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update blog post
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete blog post
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
