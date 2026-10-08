const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'smoothself_ultra_secure_jwt_secret_key_2026';

// Optional auth middleware (guest or logged-in user)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        req.user = await supabaseService.findUserById(decoded.id);
      }
    } catch (e) {
      // Guest order
    }
  }
  next();
};

// Create new order (Guest or logged-in customer) directly in Supabase
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

    if (paymentMethod === 'COD') {
      return res.status(400).json({ success: false, message: 'Cash on Delivery (COD) is currently disabled. Please select online payment.' });
    }

    // Verify stock and deduct in Supabase
    for (const item of orderItems) {
      const prodId = item.product || item.id || item._id;
      if (prodId) {
        await supabaseService.deductStock(prodId, item.quantity || 1);
      }
    }

    // If coupon used, increment coupon usage in Supabase
    if (couponCode) {
      await supabaseService.incrementCouponUsage(couponCode);
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
        product: it.product || it.id || it._id,
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
      orderStatus: 'Processing',
      customerNotes: customerNotes ? customerNotes.trim() : ''
    };

    const savedOrder = await supabaseService.createOrder(orderPayload);

    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error processing order' });
  }
});

// Get orders of logged in customer from Supabase
router.get('/my-orders', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await supabaseService.getMyOrders(userId, req.user.email);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order details by orderNumber from Supabase (also supports /track/:orderNumber)
router.get('/order-number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await supabaseService.getOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await supabaseService.getOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order by ID from Supabase
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await supabaseService.getOrderByNumber(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Customer can only view their own order unless admin
    if (req.user.role !== 'admin' && String(order.user) !== String(req.user.id) && order.customerDetails?.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all orders with filter & search from Supabase
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const orders = await supabaseService.getAllOrders(req.query);
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update order status in Supabase
router.put('/admin/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, courier, trackingNumber, note } = req.body;
    const updated = await supabaseService.updateOrderStatus(req.params.id, {
      orderStatus,
      paymentStatus,
      courier,
      trackingNumber,
      note
    });

    res.json({
      success: true,
      order: updated,
      message: `Order status updated to ${orderStatus}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
