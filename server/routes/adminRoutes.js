const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { getSupabase } = require('../config/supabase');
const { protect, adminOnly } = require('../middleware/auth');

// Admin Dashboard KPI Stats directly from Supabase
router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  try {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase client not connected');

    // Fetch counts and records in parallel from Supabase
    const [ordersRes, productsRes, usersRes, reviewsRes] = await Promise.all([
      sb.from('orders').select('*').order('created_at', { ascending: false }),
      sb.from('products').select('*'),
      sb.from('users').select('*').eq('role', 'customer'),
      sb.from('reviews').select('*').eq('is_approved', false)
    ]);

    const orders = (ordersRes.data || []).map(supabaseService.normalizeOrder);
    const products = (productsRes.data || []).map(supabaseService.normalizeProduct);
    const customers = (usersRes.data || []).map(supabaseService.normalizeUser);
    const pendingReviews = reviewsRes.data?.length || 0;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? (Number(o.totalAmount) || 0) : 0), 0);
    const lowStockItems = products.filter(p => (Number(p.stock) || 0) <= (Number(p.lowStockThreshold) || 10));

    const stats = {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length,
      processingOrders: orders.filter(o => o.orderStatus === 'Processing').length,
      deliveredOrders: orders.filter(o => o.orderStatus === 'Delivered').length,
      totalProducts: products.length,
      lowStockProducts: lowStockItems.length,
      totalCustomers: customers.length,
      pendingReviews
    };

    res.json({
      success: true,
      stats,
      recentOrders: orders.slice(0, 7),
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all customers directly from Supabase
router.get('/customers', protect, adminOnly, async (req, res) => {
  try {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase client not connected');

    const [usersRes, ordersRes] = await Promise.all([
      sb.from('users').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
      sb.from('orders').select('*')
    ]);

    const customers = (usersRes.data || []).map(supabaseService.normalizeUser);
    const orders = (ordersRes.data || []).map(supabaseService.normalizeOrder);

    const customerStats = customers.map(c => {
      const userOrders = orders.filter(o => 
        (o.user && String(o.user) === String(c.id)) ||
        (o.customerDetails?.email?.toLowerCase() === c.email?.toLowerCase())
      );
      const totalSpent = userOrders.reduce((sum, ord) => sum + (ord.paymentStatus === 'Paid' ? (Number(ord.totalAmount) || 0) : 0), 0);
      return {
        id: c.id,
        _id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        addresses: c.addresses || [],
        orderCount: userOrders.length,
        totalSpent,
        createdAt: c.createdAt
      };
    });

    res.json({ success: true, count: customerStats.length, customers: customerStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
