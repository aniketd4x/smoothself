'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Search,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminModal,
  AdminEmptyState,
  AdminLoadingState,
  AdminPagination,
} from './components/AdminUI';

const AdminOrders = () => {
  const { token, showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Status edit state inside modal
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editCourier, setEditCourier] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = () => {
    setIsLoading(true);
    let url = '/api/orders/admin/all';
    if (statusFilter !== 'all') url += `?status=${statusFilter}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [token, statusFilter]);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setEditPaymentStatus(order.paymentStatus);
    setEditTracking(order.trackingNumber || '');
    setEditCourier(order.courier || 'Bluedart Express');
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: editStatus,
          paymentStatus: editPaymentStatus,
          trackingNumber: editTracking,
          courier: editCourier,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order fulfillment updated!');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        showToast(data.message || 'Error updating order', 'error');
      }
    } catch {
      showToast('Error updating order', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      o.customerDetails?.phone?.includes(searchTerm)
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getOrderStatusBadgeVariant = (status) => {
    if (status === 'Delivered') return 'success';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Shipped') return 'dark';
    if (status === 'Processing') return 'neutral';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Orders & Fulfillment"
        subtitle="Track consignments, assign tracking AWB numbers, and update dispatch status."
        badge={`${orders.length} Orders`}
        actions={
          <AdminButton
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchOrders}
            className="w-full sm:w-auto"
          >
            Refresh Orders
          </AdminButton>
        }
      />

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-stretch lg:items-center bg-white p-4 rounded-xl border border-[#E5E5E5]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            'all',
            'Pending',
            'Processing',
            'Shipped',
            'Delivered',
            'Cancelled',
          ].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F5F5F5] text-[#6B7280] hover:text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, name, phone..."
            className="w-full min-h-[40px] pl-10 pr-3.5 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111]"
          />
        </div>
      </div>

      {/* ORDERS TABLE & MOBILE CARDS */}
      {isLoading && orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading customer orders..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Items</th>
                  <th className="py-3.5 px-5">Total Amount</th>
                  <th className="py-3.5 px-5">Payment</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">View / Fulfill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((ord) => (
                    <tr
                      key={ord._id}
                      className="hover:bg-[#F5F5F5]/60 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold text-[#111111]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#6B7280]">
                        {new Date(ord.placedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-[#111111]">
                          {ord.customerDetails?.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {ord.customerDetails?.phone}
                        </p>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#6B7280]">
                        {ord.orderItems?.length || 0} items
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#111111]">
                        ₹{ord.totalAmount}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-[#111111] text-xs">
                          {ord.paymentMethod}
                        </span>
                        <span
                          className={`block text-[11px] font-medium ${
                            ord.paymentStatus === 'Paid'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <AdminBadge
                          variant={getOrderStatusBadgeVariant(ord.orderStatus)}
                          dot
                        >
                          {ord.orderStatus}
                        </AdminBadge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <AdminButton
                          variant="secondary"
                          size="xs"
                          onClick={() => openOrderModal(ord)}
                        >
                          Manage
                        </AdminButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <AdminEmptyState
                        icon={ShoppingBag}
                        title="No orders matching criteria"
                        description="Try switching the status tab or clearing your search query."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-[#E5E5E5]">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((ord) => (
                <div key={ord._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#111111]">
                        {ord.orderNumber}
                      </span>
                      <p className="text-sm font-semibold text-[#111111] mt-0.5">
                        {ord.customerDetails?.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {ord.customerDetails?.phone}
                      </p>
                    </div>
                    <AdminBadge
                      variant={getOrderStatusBadgeVariant(ord.orderStatus)}
                      dot
                    >
                      {ord.orderStatus}
                    </AdminBadge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6B7280] bg-[#F5F5F5] px-3 py-2 rounded-lg border border-[#E5E5E5]">
                    <span>
                      {new Date(ord.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      • {ord.orderItems?.length || 0} items
                    </span>
                    <span className="font-medium text-[#111111]">
                      {ord.paymentMethod} ({ord.paymentStatus})
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[11px] uppercase font-semibold text-[#6B7280] block">
                        Total Amount
                      </span>
                      <span className="text-base font-bold text-[#111111]">
                        ₹{ord.totalAmount}
                      </span>
                    </div>
                    <AdminButton
                      variant="primary"
                      size="sm"
                      onClick={() => openOrderModal(ord)}
                    >
                      Manage Order
                    </AdminButton>
                  </div>
                </div>
              ))
            ) : (
              <AdminEmptyState
                icon={ShoppingBag}
                title="No orders matching criteria"
                description="Try switching the status tab or clearing your search query."
              />
            )}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="orders"
          />
        </div>
      )}

      {/* ORDER FULFILLMENT MODAL */}
      <AdminModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        subtitle="Order Details & Dispatch"
        title={selectedOrder?.orderNumber || ''}
        maxWidth="max-w-2xl"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setSelectedOrder(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              type="submit"
              form="admin-order-fulfillment-form"
              isLoading={isUpdating}
              loadingText="Updating..."
              className="w-full sm:w-auto"
            >
              Save Fulfillment
            </AdminButton>
          </>
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Items List */}
            <div className="border border-[#E5E5E5] rounded-xl p-4 bg-[#F5F5F5]/60 divide-y divide-[#E5E5E5]">
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider pb-2">
                Purchased Formulations
              </p>
              {selectedOrder.orderItems?.map((it, i) => (
                <div
                  key={i}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={it.image}
                      alt=""
                      className="w-10 h-12 object-cover rounded-md bg-white border border-[#E5E5E5] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111111] truncate">
                        {it.name}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {it.variantTitle} (x{it.quantity})
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#111111] flex-shrink-0">
                    ₹{it.total}
                  </span>
                </div>
              ))}
              <div className="pt-3 flex justify-between font-bold text-sm text-[#111111]">
                <span>Grand Total</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl text-xs space-y-1 leading-relaxed">
              <p className="font-semibold text-[#111111] mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#111111]" />
                <span>Customer & Shipping Address</span>
              </p>
              <p className="font-semibold text-[#111111]">
                {selectedOrder.customerDetails?.name} (
                {selectedOrder.customerDetails?.phone})
              </p>
              <p className="text-[#6B7280]">
                {selectedOrder.shippingAddress?.street}
                {selectedOrder.shippingAddress?.apartment
                  ? `, ${selectedOrder.shippingAddress.apartment}`
                  : ''}
              </p>
              <p className="text-[#6B7280]">
                {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.state} -{' '}
                {selectedOrder.shippingAddress?.postalCode}
              </p>
              {selectedOrder.customerNotes && (
                <div className="text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg mt-2">
                  <strong>Note:</strong> {selectedOrder.customerNotes}
                </div>
              )}
            </div>

            {/* FULFILLMENT FORM */}
            <form
              id="admin-order-fulfillment-form"
              onSubmit={handleUpdateOrder}
              className="space-y-4 pt-2 border-t border-[#E5E5E5]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminSelect
                  label="Order Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </AdminSelect>

                <AdminSelect
                  label="Payment Status"
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </AdminSelect>

                <AdminInput
                  label="Courier Partner"
                  value={editCourier}
                  onChange={(e) => setEditCourier(e.target.value)}
                  placeholder="e.g. Bluedart / Delhivery / DTDC"
                />

                <AdminInput
                  label="Tracking AWB Number"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  placeholder="e.g. BD-894729103"
                  className="font-mono font-semibold"
                />
              </div>
            </form>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminOrders;
