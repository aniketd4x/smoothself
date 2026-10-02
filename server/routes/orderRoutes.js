const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'smoothself_ultra_secure_jwt_secret_key_2026';

// Optional auth middleware (guest or logged-in user)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (isDBConnected()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (e) {}
      }
      if (!req.user) {
        req.user = localStore.findUserById(decoded.id);
      }
    } catch (e) {
      // Guest order
    }
  }
  next();
};

// Create new order (Guest or logged-in customer)
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

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }

    if (!customerDetails?.name || !customerDetails?.email || !customerDetails?.phone) {
      return res.status(400).json({ success: false, message: 'Please provide complete contact information (name, email, phone)' });
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide full delivery address (street, city, pincode)' });
    }

    // Verify stock and update inventory where possible
    for (const item of orderItems) {
      if (isDBConnected()) {
        try {
          // If valid ObjectId hex, check in MongoDB
          if (String(item.product).match(/^[0-9a-fA-F]{24}$/)) {
            const prod = await Product.findById(item.product);
            if (prod) {
              if (prod.stock < item.quantity) {
                return res.status(400).json({
                  success: false,
                  message: `Insufficient stock for ${item.name}. Available: ${prod.stock}`
                });
              }
              prod.stock = Math.max(0, prod.stock - item.quantity);
              await prod.save();
            }
          }
        } catch (e) {
          console.warn('[Order Stock DB Warning]', e.message);
        }
      }
      // Also deduct in localStore
      localStore.deductStock(item.product, item.quantity || 1);
    }

    // If coupon used, increment coupon usage
    if (couponCode) {
      if (isDBConnected()) {
        try {
          await Coupon.findOneAndUpdate(
            { code: couponCode.trim().toUpperCase() },
            { $inc: { usageCount: 1 } }
          );
        } catch (e) {}
      }
    }

    // Generate unique order number (e.g. AB-948123-456)
    const orderNumber = `AB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      orderNumber,
      user: req.user ? (req.user._id || req.user.id) : null,
      customerDetails: {
        name: customerDetails.name.trim(),
        email: customerDetails.email.trim().toLowerCase(),
        phone: customerDetails.phone.trim()
      },
      shippingAddress: {
        street: shippingAddress.street.trim(),
        apartment: shippingAddress.apartment ? shippingAddress.apartment.trim() : '',
        city: shippingAddress.city.trim(),
        state: shippingAddress.state || 'Karnataka',
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country || 'India'
      },
      orderItems: orderItems.map(it => ({
        product: it.product,
        name: it.name,
        slug: it.slug || '',
        image: it.image || '/logo.webp',
        variantTitle: it.variantTitle || 'Standard',
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        total: Number(it.total) || (Number(it.price) * Number(it.quantity))
      })),
      shippingMethod: shippingMethod || 'Standard Delivery',
      shippingCost: Number(shippingCost) || 0,
      subtotal: Number(subtotal) || 0,
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode ? couponCode.trim().toUpperCase() : '',
      taxAmount: Number(taxAmount) || 0,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      paymentDetails: {
        paidAt: paymentMethod !== 'COD' ? new Date() : null,
        transactionId: paymentMethod !== 'COD' ? `TXN-${Date.now()}` : null
      },
      orderStatus: 'Processing',
      courier: 'Bluedart / Delhivery Express',
      trackingNumber: `TRACK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      customerNotes: customerNotes ? customerNotes.trim() : '',
      placedAt: new Date()
    };

    let savedOrder = null;

    // Save to DB if connected
    if (isDBConnected()) {
      try {
        savedOrder = await Order.create(orderPayload);
      } catch (dbErr) {
        console.warn('[Order DB Warning]', dbErr.message);
      }
    }

    // Always persist to localStore as well for maximum reliability
    const localOrder = localStore.createOrder(orderPayload);
    const finalOrder = savedOrder || localOrder;

    res.status(201).json({
      success: true,
      order: finalOrder
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error processing order' });
  }
});

// Get orders of logged in customer
router.get('/my-orders', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let orders = [];

    if (isDBConnected()) {
      try {
        orders = await Order.find({ user: userId }).sort({ placedAt: -1 });
      } catch (e) {}
    }

    if (!orders || orders.length === 0) {
      orders = localStore.findOrdersByUserId(userId);
      // Also match by email if user ID differs
      if (orders.length === 0 && req.user.email) {
        const allLocal = localStore.getAllOrders();
        orders = allLocal.filter(o => o.customerDetails?.email?.toLowerCase() === req.user.email.toLowerCase());
      }
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track order by order number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    let order = null;

    if (isDBConnected()) {
      try {
        order = await Order.findOne({ orderNumber });
      } catch (e) {}
    }

    if (!order) {
      order = localStore.findOrderByOrderNumber(orderNumber);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all orders
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;
    let orders = [];

    if (isDBConnected()) {
      try {
        let query = {};
        if (status && status !== 'all') query.orderStatus = status;
        if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
        if (search) {
          query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'customerDetails.name': { $regex: search, $options: 'i' } },
            { 'customerDetails.email': { $regex: search, $options: 'i' } },
            { 'customerDetails.phone': { $regex: search, $options: 'i' } }
          ];
        }
        orders = await Order.find(query).sort({ placedAt: -1 });
      } catch (e) {}
    }

    if (!orders || orders.length === 0) {
      orders = localStore.getAllOrders({ status, paymentStatus, search });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update order status & tracking info
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, courier, adminNotes } = req.body;
    let order = null;

    if (isDBConnected()) {
      try {
        order = await Order.findById(req.params.id);
        if (order) {
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
        }
      } catch (e) {}
    }

    const localUpdated = localStore.updateOrderStatus(req.params.id, {
      orderStatus,
      paymentStatus,
      trackingNumber,
      courier,
      adminNotes
    });

    const finalOrder = order || localUpdated;
    if (!finalOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order: finalOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
