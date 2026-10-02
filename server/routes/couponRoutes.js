const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Validate coupon directly against Supabase
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const validation = await supabaseService.validateCoupon(code, orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    res.json({
      success: true,
      coupon: validation.coupon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all coupons from Supabase
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await supabaseService.getCoupons();
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create coupon in Supabase
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await supabaseService.createCoupon(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Delete coupon in Supabase
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await supabaseService.deleteCoupon(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully from Supabase' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
