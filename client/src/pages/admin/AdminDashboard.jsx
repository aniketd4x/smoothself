import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Plus
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, showToast } = useApp();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = () => {
    setIsLoading(true);
    fetch('/api/admin/dashboard-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [token]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(`Order status updated to ${newStatus}`);
        fetchDashboardStats();
      }
    } catch {
      showToast('Error updating order status', 'error');
    }
  };

  if (isLoading && !data) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockItems = data?.lowStockItems || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Store Performance & Analytics
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Real-time live store analytics, fulfillment tracking, and inventory status.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-lg shadow hover:bg-brand-hover transition flex-1 sm:flex-initial text-center"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2.5 bg-white border border-brand-border text-brand-primary text-xs font-semibold rounded-lg shadow-sm hover:bg-brand-surface transition flex-1 sm:flex-initial text-center"
          >
            <span>View All Orders</span>
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Revenue */}
        <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Revenue</p>
            <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-extrabold text-brand-primary mt-1">
              ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center space-x-1">
              <TrendingUp size={12} />
              <span>Live Gross Sales</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0 bg-purple-100 text-brand-primary flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Orders</p>
            <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-extrabold text-brand-primary mt-1">
              {stats.totalOrders || 0}
            </h3>
            <p className="text-[11px] text-brand-muted mt-1">
              {stats.processingOrders || 0} Processing • {stats.deliveredOrders || 0} Delivered
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0 bg-blue-100 text-blue-700 flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Active Products */}
        <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Catalog Products</p>
            <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-extrabold text-brand-primary mt-1">
              {stats.totalProducts || 0}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              All Active & Published
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0 bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-extrabold text-rose-600 mt-1">
              {stats.lowStockProducts || 0}
            </h3>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              Requires Reordering
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0 bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* LOW STOCK ALERTS SECTION */}
      {lowStockItems.length > 0 && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Inventory Alert: {lowStockItems.length} products below restock threshold!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map(item => (
              <div key={item._id} className="p-3 bg-white rounded-lg border border-rose-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-brand-text truncate">{item.name}</p>
                  <p className="text-[11px] text-brand-muted">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {item.stock} left
                  </span>
                  <Link to="/admin/products" className="block text-[11px] text-brand-primary underline mt-0.5">
                    Restock
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-brand-primary">Recent Orders</h3>
            <p className="text-xs text-brand-muted">Latest customer purchases requiring dispatch.</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-brand-surface/40 transition">
                    <td className="p-4 font-mono font-bold text-brand-primary">{order.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-brand-text">{order.customerDetails?.name}</p>
                      <p className="text-[11px] text-brand-muted">{order.customerDetails?.phone}</p>
                    </td>
                    <td className="p-4 text-brand-muted">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-brand-primary">₹{order.totalAmount}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-[11px] font-medium">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold border focus:outline-none ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-purple-50 text-purple-800 border-purple-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
