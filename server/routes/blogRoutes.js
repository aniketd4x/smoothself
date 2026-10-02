const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Public: Get all published blog posts
router.get('/', async (req, res) => {
  try {
    let posts = [];
    if (isDBConnected()) {
      try {
        posts = await BlogPost.find({ published: true }).sort({ publishedAt: -1 });
      } catch (e) {}
    }
    if (!posts || posts.length === 0) {
      posts = (localStore.data.blogs || []).filter(b => b.published !== false);
    }
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let post = null;
    if (isDBConnected()) {
      try {
        post = await BlogPost.findOne({ slug });
      } catch (e) {}
    }
    if (!post && localStore.data.blogs) {
      post = localStore.data.blogs.find(b => b.slug === slug || String(b._id) === String(slug));
    }
    if (!post) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all posts
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    let posts = [];
    if (isDBConnected()) {
      try {
        posts = await BlogPost.find().sort({ publishedAt: -1 });
      } catch (e) {}
    }
    if (!posts || posts.length === 0) {
      posts = localStore.data.blogs || [];
    }
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
    
    let post = null;
    if (isDBConnected()) {
      try {
        post = await BlogPost.create({
          title,
          slug,
          excerpt,
          content,
          coverImage: coverImage || '',
          author: author || 'Botanical Science Team',
          tags: tags || [],
          published: published !== undefined ? published : true
        });
      } catch (e) {}
    }

    if (!post) {
      post = {
        _id: 'blog-' + Date.now(),
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || '',
        author: author || 'Botanical Science Team',
        tags: tags || [],
        published: published !== undefined ? published : true,
        createdAt: new Date().toISOString()
      };
      if (!localStore.data.blogs) localStore.data.blogs = [];
      localStore.data.blogs.push(post);
      localStore.saveData();
    }

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update blog post
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    let post = null;
    if (isDBConnected()) {
      try {
        post = await BlogPost.findByIdAndUpdate(id, req.body, { new: true });
      } catch (e) {}
    }
    if (localStore.data.blogs) {
      const idx = localStore.data.blogs.findIndex(b => String(b._id) === String(id));
      if (idx !== -1) {
        Object.assign(localStore.data.blogs[idx], req.body);
        localStore.saveData();
        if (!post) post = localStore.data.blogs[idx];
      }
    }
    if (!post) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete blog post
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      try {
        await BlogPost.findByIdAndDelete(id);
      } catch (e) {}
    }
    if (localStore.data.blogs) {
      localStore.data.blogs = localStore.data.blogs.filter(b => String(b._id) !== String(id));
      localStore.saveData();
    }
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
