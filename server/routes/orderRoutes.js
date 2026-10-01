const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// Optional protect middleware (allows guest checkout or logged in user)
const optionalAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  const JWT_SECRET = process.env.JWT_SECRET || 'smoothself_ultra_secure_jwt_secret_key_2026';

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Guest order
    }
  }
  next();
};

// Create new order (Guest or authenticated customer)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      customerDetails,
      shippingAddress,
      orderItems,
      shippingMethod,
      shippingCost,
      subtotal,
      discountAmount,
      couponCode,
      taxAmount,
      totalAmount,
      paymentMethod,
      customerNotes
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!customerDetails || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Customer details and address are required' });
    }

    // Verify stock and calculate verified items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}. Available: ${product.stock}` });
      }
      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    // If coupon used, increment coupon usage count
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }

    // Generate unique order number (e.g. AB-2026-94812)
    const orderNumber = `AB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      customerDetails,
      shippingAddress,
      orderItems,
      shippingMethod: shippingMethod || 'Standard Delivery',
      shippingCost: shippingCost || 0,
      subtotal,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || '',
      taxAmount: taxAmount || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      paymentDetails: {
        paidAt: paymentMethod !== 'COD' ? new Date() : null,
        transactionId: paymentMethod !== 'COD' ? `TXN-${Date.now()}` : null
      },
      orderStatus: 'Processing',
      customerNotes: customerNotes || ''
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get orders of logged in customer
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ placedAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track order by order number and email / phone
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all orders with filtering and search
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query).sort({ placedAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update order status & tracking info
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, courier, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'Paid';
      }
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courier !== undefined) order.courier = courier;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
