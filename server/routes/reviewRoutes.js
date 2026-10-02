const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Public: Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    let reviews = [];
    if (isDBConnected()) {
      try {
        reviews = await Review.find({
          product: req.params.productId,
          isApproved: true
        }).sort({ createdAt: -1 });
      } catch (e) {}
    }
    if (!reviews || reviews.length === 0) {
      reviews = (localStore.data.reviews || []).filter(r => 
        (r.product === req.params.productId || r.productId === req.params.productId) && r.isApproved !== false
      );
    }

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Add a review
router.post('/product/:productId', async (req, res) => {
  try {
    const { userName, userEmail, rating, title, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide name, rating, and review text' });
    }

    let review = null;
    if (isDBConnected()) {
      try {
        review = await Review.create({
          product: req.params.productId,
          userName,
          userEmail: userEmail || '',
          rating: Number(rating),
          title: title || '',
          comment,
          isVerifiedPurchase: true,
          isApproved: true
        });

        // Recalculate product rating
        const allReviews = await Review.find({ product: req.params.productId, isApproved: true });
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

        await Product.findByIdAndUpdate(req.params.productId, {
          rating: Math.round(avgRating * 10) / 10,
          numReviews: allReviews.length
        });
      } catch (e) {}
    }

    if (!review) {
      review = {
        _id: 'rev-' + Date.now(),
        product: req.params.productId,
        productId: req.params.productId,
        userName,
        userEmail: userEmail || '',
        rating: Number(rating),
        title: title || '',
        comment,
        isVerifiedPurchase: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      };
      if (!localStore.data.reviews) localStore.data.reviews = [];
      localStore.data.reviews.push(review);
      localStore.saveData();
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all reviews
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    let reviews = [];
    if (isDBConnected()) {
      try {
        reviews = await Review.find().populate('product', 'name slug images').sort({ createdAt: -1 });
      } catch (e) {}
    }
    if (!reviews || reviews.length === 0) {
      reviews = localStore.data.reviews || [];
    }
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Approve review
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    let review = null;
    if (isDBConnected()) {
      try {
        review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
      } catch (e) {}
    }
    if (localStore.data.reviews) {
      const idx = localStore.data.reviews.findIndex(r => String(r._id) === String(req.params.id));
      if (idx !== -1) {
        localStore.data.reviews[idx].isApproved = true;
        localStore.saveData();
        if (!review) review = localStore.data.reviews[idx];
      }
    }
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete review
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (isDBConnected()) {
      try {
        await Review.findByIdAndDelete(req.params.id);
      } catch (e) {}
    }
    if (localStore.data.reviews) {
      localStore.data.reviews = localStore.data.reviews.filter(r => String(r._id) !== String(req.params.id));
      localStore.saveData();
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
