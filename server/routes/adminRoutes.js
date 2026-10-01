const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// Admin Dashboard KPI Stats & Charts
router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingReviews = await Review.countDocuments({ isApproved: false });

    // Calculate revenue
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent orders
    const recentOrders = await Order.find().sort({ placedAt: -1 }).limit(7);

    // Low stock items
    const lowStockItems = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).select('name sku stock lowStockThreshold images price');

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        pendingReviews
      },
      recentOrders,
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all customers
router.get('/customers', protect, adminOnly, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    // Enhance each customer with order count and total spend
    const customerStats = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({ user: c._id });
        const totalSpent = orders.reduce((sum, ord) => sum + (ord.paymentStatus === 'Paid' ? ord.totalAmount : 0), 0);
        return {
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          addresses: c.addresses,
          orderCount: orders.length,
          totalSpent,
          createdAt: c.createdAt
        };
      })
    );

    res.json({ success: true, count: customerStats.length, customers: customerStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
