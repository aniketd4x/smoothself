const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Get reviews for a product from Supabase
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await supabaseService.getProductReviews(req.params.productId);
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Add a review in Supabase
router.post('/product/:productId', async (req, res) => {
  try {
    const { userName, userEmail, rating, title, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide name, rating, and review text' });
    }

    const review = await supabaseService.createReview({
      productId: req.params.productId,
      userName,
      userEmail: userEmail || '',
      rating: Number(rating),
      title: title || '',
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all reviews from Supabase
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await supabaseService.getAllReviews();
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Approve review in Supabase
router.put('/admin/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const review = await supabaseService.approveReview(req.params.id);
    res.json({ success: true, message: 'Review approved', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete review in Supabase
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    await supabaseService.deleteReview(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
