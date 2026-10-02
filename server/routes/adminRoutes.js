const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Admin Dashboard KPI Stats
router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  try {
    let stats = null;
    let recentOrders = [];
    let lowStockItems = [];

    if (isDBConnected()) {
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

        const revenueAgg = await Order.aggregate([
          { $match: { paymentStatus: 'Paid' } },
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

        recentOrders = await Order.find().sort({ placedAt: -1 }).limit(7);
        lowStockItems = await Product.find({
          $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        }).select('name sku stock lowStockThreshold images price');

        stats = {
          totalRevenue,
          totalOrders,
          pendingOrders,
          processingOrders,
          deliveredOrders,
          totalProducts,
          lowStockProducts,
          totalCustomers,
          pendingReviews
        };
      } catch (e) {}
    }

    if (!stats) {
      const orders = localStore.getAllOrders();
      const products = localStore.getProducts();
      const customers = localStore.data.users.filter(u => u.role === 'customer');
      const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);

      stats = {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length,
        processingOrders: orders.filter(o => o.orderStatus === 'Processing').length,
        deliveredOrders: orders.filter(o => o.orderStatus === 'Delivered').length,
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock <= (p.lowStockThreshold || 10)).length,
        totalCustomers: customers.length,
        pendingReviews: 0
      };

      recentOrders = orders.slice(0, 7);
      lowStockItems = products.filter(p => p.stock <= (p.lowStockThreshold || 10));
    }

    res.json({
      success: true,
      stats,
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
    let customerStats = [];

    if (isDBConnected()) {
      try {
        const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
        customerStats = await Promise.all(
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
      } catch (e) {}
    }

    if (!customerStats.length) {
      const localCustomers = localStore.data.users.filter(u => u.role === 'customer');
      const allOrders = localStore.getAllOrders();
      customerStats = localCustomers.map(c => {
        const userOrders = allOrders.filter(o => o.user && String(o.user) === String(c._id));
        const totalSpent = userOrders.reduce((sum, ord) => sum + (ord.paymentStatus === 'Paid' ? ord.totalAmount : 0), 0);
        return {
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          addresses: c.addresses || [],
          orderCount: userOrders.length,
          totalSpent,
          createdAt: c.createdAt
        };
      });
    }

    res.json({ success: true, count: customerStats.length, customers: customerStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
