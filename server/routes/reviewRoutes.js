const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true
    }).sort({ createdAt: -1 });

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

    const review = await Review.create({
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

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all reviews
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().populate('product', 'name slug images').sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Toggle approve review
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete review
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
