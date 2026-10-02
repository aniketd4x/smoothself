const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Public: Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(orderAmount) || 0;

    // First validate in localStore
    const localValidation = localStore.validateCoupon(cleanCode, amount);
    if (localValidation.valid) {
      return res.json({
        success: true,
        coupon: localValidation.coupon
      });
    }

    // Also check MongoDB if connected
    if (isDBConnected()) {
      try {
        const coupon = await Coupon.findOne({
          code: cleanCode,
          isActive: true,
          expiryDate: { $gte: new Date() }
        });

        if (coupon) {
          if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'This coupon usage limit has been reached' });
          }
          if (amount < coupon.minOrderAmount) {
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
      } catch (e) {}
    }

    res.status(404).json({ success: false, message: localValidation.message || 'Invalid or expired coupon code' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all coupons
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    let coupons = [];
    if (isDBConnected()) {
      try {
        coupons = await Coupon.find().sort({ createdAt: -1 });
      } catch (e) {}
    }
    if (!coupons || coupons.length === 0) {
      coupons = localStore.data.coupons;
    }
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create coupon
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, isActive } = req.body;
    const cleanCode = code.trim().toUpperCase();

    let coupon = null;
    if (isDBConnected()) {
      try {
        coupon = await Coupon.create({
          code: cleanCode,
          description,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount) || 0,
          maxDiscountAmount: Number(maxDiscountAmount) || 0,
          expiryDate: new Date(expiryDate),
          usageLimit: Number(usageLimit) || 1000,
          isActive: isActive !== undefined ? isActive : true
        });
      } catch (e) {}
    }

    const localCpn = {
      _id: 'cpn-' + Date.now(),
      code: cleanCode,
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue) || 10,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      expiryDate: new Date(expiryDate || '2028-12-31').toISOString(),
      usageLimit: Number(usageLimit) || 1000,
      usageCount: 0,
      isActive: isActive !== undefined ? isActive : true
    };
    localStore.data.coupons.push(localCpn);
    localStore.saveData();

    res.status(201).json({ success: true, coupon: coupon || localCpn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete coupon
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (isDBConnected()) {
      try {
        await Coupon.findByIdAndDelete(req.params.id);
      } catch (e) {}
    }
    localStore.data.coupons = localStore.data.coupons.filter(c => String(c._id) !== req.params.id && c.code !== req.params.id);
    localStore.saveData();
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
