const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');

// Public: Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(orderAmount) || 0;

    // Check in-memory / localStore
    const localValidation = localStore.validateCoupon(cleanCode, amount);
    if (localValidation.valid) {
      return res.json({
        success: true,
        coupon: localValidation.coupon
      });
    }

    // Also check Supabase
    const coupons = await supabaseService.getCoupons();
    const coupon = coupons.find(c => c.code === cleanCode && c.isActive);

    if (coupon) {
      if (amount < (coupon.minOrderAmount || 0)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
        });
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (amount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }
      if (discount > amount) discount = amount;

      return res.json({
        success: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: Math.round(discount),
          description: coupon.description
        }
      });
    }

    res.status(404).json({ success: false, message: localValidation.message || 'Invalid or expired coupon code' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all coupons
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await supabaseService.getCoupons();
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create coupon
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await supabaseService.createCoupon(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete coupon
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteCoupon(id);
    res.json({ success: true, message: 'Coupon deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
