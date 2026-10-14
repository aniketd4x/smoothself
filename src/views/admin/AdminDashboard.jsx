'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Star,
  BarChart3,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminBadge,
  AdminEmptyState,
  AdminLoadingState,
} from './components/AdminUI';

const AdminDashboard = () => {
  const { token, showToast } = useApp();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  const fetchDashboardStats = () => {
    setIsLoading(true);
    setError('');
    fetch('/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.message || 'Unable to load dashboard analytics.');
        }
      })
      .catch(() => {
        setError('Network error while loading dashboard statistics.');
      })
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(`Order status updated to ${newStatus}`);
        fetchDashboardStats();
      } else {
        showToast(resData.message || 'Error updating order status', 'error');
      }
    } catch {
      showToast('Error updating order status', 'error');
    }
  };

  if (isLoading && !data) {
    return <AdminLoadingState message="Loading live store analytics..." />;
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockItems = data?.lowStockItems || [];

  const totalOrdersCount = Number(stats.totalOrders) || 0;
  const deliveredCount = Number(stats.deliveredOrders) || 0;
  const pendingOrProcessingCount =
    Number(stats.pendingOrders) || Number(stats.processingOrders) || 0;
  const otherOrdersCount = Math.max(
    0,
    totalOrdersCount - deliveredCount - pendingOrProcessingCount
  );

  const deliveredPct =
    totalOrdersCount > 0
      ? Math.round((deliveredCount / totalOrdersCount) * 100)
      : 0;
  const activePipelinePct =
    totalOrdersCount > 0
      ? Math.round((pendingOrProcessingCount / totalOrdersCount) * 100)
      : 0;
  const otherPct =
    totalOrdersCount > 0
      ? Math.max(0, 100 - deliveredPct - activePipelinePct)
      : 0;

  const avgOrderValue =
    recentOrders.length > 0
      ? Math.round(
          recentOrders.reduce(
            (sum, o) => sum + (Number(o.totalAmount) || 0),
            0
          ) / recentOrders.length
        )
      : 0;

  const maxRecentOrderAmount = Math.max(
    1,
    ...recentOrders.map((o) => Number(o.totalAmount) || 0)
  );

  const filteredRecentOrders = recentOrders.filter((order) => {
    const matchesStatus =
      orderStatusFilter === 'All' || order.orderStatus === orderStatusFilter;
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.customerDetails?.name?.toLowerCase().includes(q) ||
      order.customerDetails?.phone?.includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusSelectStyle = (status) => {
    if (status === 'Delivered') {
      return 'bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]';
    }
    if (status === 'Cancelled') {
      return 'bg-black text-white border-black';
    }
    if (status === 'Shipped') {
      return 'bg-[#111111] text-white border-[#111111]';
    }
    return 'bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <AdminPageHeader
        title="Store Performance & Analytics"
        subtitle="Real-time live store analytics, fulfillment tracking, and inventory status."
        badge="LIVE"
        actions={
          <>
            <button
              type="button"
              onClick={fetchDashboardStats}
              title="Refresh analytics"
              className="min-h-[44px] sm:min-h-[40px] px-3 py-2 bg-white border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F5F5F5] text-[#111111] rounded-lg text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw
                size={15}
                className={isLoading ? 'animate-spin' : ''}
              />
              <span className="sm:hidden lg:inline">Refresh</span>
            </button>
            <Link
              to="/admin/orders"
              className="min-h-[44px] sm:min-h-[40px] px-4 py-2.5 bg-white border border-[#111111] text-[#111111] hover:bg-[#F5F5F5] text-[13px] font-medium rounded-lg transition-colors inline-flex items-center justify-center flex-1 sm:flex-initial text-center"
            >
              <span>View All Orders</span>
            </Link>
            <Link
              to="/admin/products"
              className="min-h-[44px] sm:min-h-[40px] px-4 py-2.5 bg-[#111111] hover:bg-[#262626] text-white border border-[#111111] text-[13px] font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial text-center"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </Link>
          </>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchDashboardStats}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-200 font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <AdminStatCard
          label="Total Revenue"
          value={`₹${stats.totalRevenue?.toLocaleString('en-IN') || 0}`}
          iconText="₹"
          subtextVariant="success"
          subtext={
            <>
              <TrendingUp size={13} />
              <span>Live Gross Sales</span>
            </>
          }
        />

        <AdminStatCard
          label="Total Orders"
          value={stats.totalOrders || 0}
          icon={ShoppingBag}
          subtext={`${stats.processingOrders || 0} Processing • ${
            stats.deliveredOrders || 0
          } Delivered`}
        />

        <AdminStatCard
          label="Catalog Products"
          value={stats.totalProducts || 0}
          icon={Package}
          subtextVariant="success"
          subtext="All Active & Published"
        />

        <AdminStatCard
          label="Low Stock Alerts"
          value={stats.lowStockProducts || 0}
          icon={AlertTriangle}
          alert={(stats.lowStockProducts || 0) > 0}
          subtextVariant={
            (stats.lowStockProducts || 0) > 0 ? 'danger' : 'muted'
          }
          subtext={
            (stats.lowStockProducts || 0) > 0
              ? 'Requires Reordering'
              : 'Stock Levels Healthy'
          }
        />
      </div>

      {/* ANALYTICS & CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Order Fulfillment Pipeline Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">
                Fulfillment Pipeline
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Distribution across {totalOrdersCount} total orders
              </p>
            </div>
            <AdminBadge variant="neutral">
              {deliveredPct}% Fulfilled
            </AdminBadge>
          </div>

          <div className="space-y-3.5">
            {/* Delivered */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111111] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#111111]" />
                  <span>Delivered</span>
                </span>
                <span className="font-mono text-[#6B7280]">
                  {deliveredCount} ({deliveredPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F5F5F5] overflow-hidden border border-[#E5E5E5]">
                <div
                  className="h-full bg-[#111111] rounded-full transition-all duration-500"
                  style={{ width: `${deliveredPct}%` }}
                />
              </div>
            </div>

            {/* Active / Processing */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111111] flex items-center gap-1.5">
                  <Clock size={13} className="text-[#6B7280]" />
                  <span>Pending & Processing</span>
                </span>
                <span className="font-mono text-[#6B7280]">
                  {pendingOrProcessingCount} ({activePipelinePct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F5F5F5] overflow-hidden border border-[#E5E5E5]">
                <div
                  className="h-full bg-[#6B7280] rounded-full transition-all duration-500"
                  style={{ width: `${activePipelinePct}%` }}
                />
              </div>
            </div>

            {/* Shipped / Cancelled / Other */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111111]">
                  In Transit / Other
                </span>
                <span className="font-mono text-[#6B7280]">
                  {otherOrdersCount} ({otherPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F5F5F5] overflow-hidden border border-[#E5E5E5]">
                <div
                  className="h-full bg-[#D4D4D4] rounded-full transition-all duration-500"
                  style={{ width: `${otherPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/admin/customers"
              className="p-2.5 rounded-lg bg-[#F5F5F5] hover:bg-[#EBEBEB] border border-[#E5E5E5] transition-colors flex items-center justify-between"
            >
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">
                  Customers
                </span>
                <span className="text-sm font-bold text-[#111111]">
                  {stats.totalCustomers || 0}
                </span>
              </div>
              <Users size={15} className="text-[#6B7280]" />
            </Link>

            <Link
              to="/admin/reviews"
              className="p-2.5 rounded-lg bg-[#F5F5F5] hover:bg-[#EBEBEB] border border-[#E5E5E5] transition-colors flex items-center justify-between"
            >
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">
                  Pending Reviews
                </span>
                <span className="text-sm font-bold text-[#111111]">
                  {stats.pendingReviews || 0}
                </span>
              </div>
              <Star size={15} className="text-[#6B7280]" />
            </Link>
          </div>
        </div>

        {/* Recent Order Value Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                <BarChart3 size={16} />
                <span>Recent Order Value Trend</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Order value comparison across the latest transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AdminBadge variant="neutral">
                Avg. Order: ₹{avgOrderValue.toLocaleString('en-IN')}
              </AdminBadge>
            </div>
          </div>

          {recentOrders.length > 0 ? (
            <div className="pt-4 pb-1">
              <div className="h-36 flex items-end gap-2.5 sm:gap-4 px-2 border-b border-[#E5E5E5] pb-2">
                {recentOrders
                  .slice()
                  .reverse()
                  .map((ord) => {
                    const amt = Number(ord.totalAmount) || 0;
                    const heightPct = Math.max(
                      14,
                      Math.round((amt / maxRecentOrderAmount) * 100)
                    );
                    return (
                      <div
                        key={ord._id}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-8 bg-[#111111] text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap z-10">
                          {ord.orderNumber}: ₹{amt}
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-[#6B7280] mb-1">
                          ₹{amt}
                        </span>
                        <div
                          className="w-full max-w-[44px] rounded-t-md bg-[#111111] group-hover:bg-[#262626] transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center gap-2.5 sm:gap-4 px-2 pt-2">
                {recentOrders
                  .slice()
                  .reverse()
                  .map((ord) => (
                    <div
                      key={ord._id}
                      className="flex-1 text-center text-[10px] font-mono text-[#6B7280] truncate"
                    >
                      {ord.orderNumber?.slice(-6) || 'ORD'}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[#6B7280]">
              No recent order data to plot yet.
            </div>
          )}
        </div>
      </div>

      {/* LOW STOCK ALERTS SECTION */}
      {lowStockItems.length > 0 && (
        <div className="p-4 sm:p-6 bg-white border border-red-200 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-red-700 font-semibold text-sm">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <span>
                  Inventory Alert: {lowStockItems.length} products below restock
                  threshold
                </span>
                <p className="text-xs font-normal text-[#6B7280]">
                  Replenish warehouse stock to prevent storefront stockouts.
                </p>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <span>Manage Inventory</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item._id}
                className="p-3.5 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#111111] truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#6B7280] mt-0.5">
                    SKU: {item.sku}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-block font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                    {item.stock} left
                  </span>
                  <Link
                    to="/admin/products"
                    className="block text-[11px] font-medium text-[#111111] underline mt-1 hover:text-[#6B7280]"
                  >
                    Restock
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ORDERS TABLE & MOBILE CARDS */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        {/* Card Header & Filters */}
        <div className="p-4 sm:p-6 border-b border-[#E5E5E5] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#111111]">
                Recent Orders
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Latest customer purchases requiring dispatch and status updates.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white border border-[#111111] text-[#111111] hover:bg-[#F5F5F5] text-xs font-medium inline-flex items-center justify-center gap-1 self-start sm:self-auto transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                'All',
                'Pending',
                'Processing',
                'Shipped',
                'Delivered',
                'Cancelled',
              ].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F5F5F5] text-[#6B7280] hover:text-[#111111] border border-[#E5E5E5]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
              />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Filter recent orders..."
                className="w-full min-h-[38px] pl-9 pr-3 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111]"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Payment</th>
                <th className="py-3.5 px-5 text-right">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredRecentOrders.length > 0 ? (
                filteredRecentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-[#F5F5F5]/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-semibold text-[#111111]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-[#111111]">
                        {order.customerDetails?.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {order.customerDetails?.phone}
                      </p>
                    </td>
                    <td className="py-3.5 px-5 text-[#6B7280] text-xs">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#111111]">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3.5 px-5">
                      <AdminBadge variant="neutral">
                        {order.paymentMethod}
                      </AdminBadge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order._id, e.target.value)
                        }
                        aria-label={`Order status for ${order.orderNumber}`}
                        className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-[#111111] cursor-pointer ${getStatusSelectStyle(
                          order.orderStatus
                        )}`}
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
                  <td colSpan={6}>
                    <AdminEmptyState
                      icon={ShoppingBag}
                      title="No orders recorded yet"
                      description="Orders matching your filter criteria will appear here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden divide-y divide-[#E5E5E5]">
          {filteredRecentOrders.length > 0 ? (
            filteredRecentOrders.map((order) => (
              <div key={order._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#111111]">
                      {order.orderNumber}
                    </span>
                    <p className="text-sm font-semibold text-[#111111] mt-0.5">
                      {order.customerDetails?.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {order.customerDetails?.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#111111]">
                      ₹{order.totalAmount}
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      • {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs font-medium text-[#6B7280]">
                    Fulfillment Status
                  </span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleUpdateOrderStatus(order._id, e.target.value)
                    }
                    className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold border focus:outline-none ${getStatusSelectStyle(
                      order.orderStatus
                    )}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          ) : (
            <AdminEmptyState
              icon={ShoppingBag}
              title="No orders recorded yet"
              description="Orders matching your filter criteria will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
