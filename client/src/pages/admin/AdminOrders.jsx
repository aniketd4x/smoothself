import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Search, Eye, Truck, CheckCircle2, Clock, X, MapPin } from 'lucide-react';

const AdminOrders = () => {
  const { token, showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderStatus: editStatus,
          paymentStatus: editPaymentStatus,
          trackingNumber: editTracking,
          courier: editCourier
        })
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

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerDetails?.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Track consignments, assign tracking AWB numbers, and update dispatch status.
          </p>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-brand-border shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-surface text-brand-text hover:bg-brand-border/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-72 bg-brand-surface px-3 py-2 rounded-lg border border-brand-border">
          <Search size={16} className="text-brand-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, name, phone..."
            className="w-full bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">View / Fulfill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-brand-surface/40 transition">
                    <td className="p-4 font-mono font-bold text-brand-primary">{ord.orderNumber}</td>
                    <td className="p-4 text-brand-muted">
                      {new Date(ord.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-brand-text">{ord.customerDetails?.name}</p>
                      <p className="text-[11px] text-brand-muted">{ord.customerDetails?.phone}</p>
                    </td>
                    <td className="p-4">{ord.orderItems?.length} items</td>
                    <td className="p-4 font-extrabold text-brand-primary">₹{ord.totalAmount}</td>
                    <td className="p-4">
                      <span className="font-semibold text-brand-text">{ord.paymentMethod}</span>
                      <span className={`block text-[10px] ${ord.paymentStatus === 'Paid' ? 'text-emerald-600 font-bold' : 'text-amber-600'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="px-3 py-1.5 bg-brand-surface hover:bg-brand-primary hover:text-white rounded-lg font-semibold text-brand-primary text-xs transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-muted">
                    No orders matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER FULFILLMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 z-10 space-y-6">
              
              <div className="flex justify-between items-center border-b border-brand-border pb-4">
                <div>
                  <span className="text-xs text-brand-muted">Order Details</span>
                  <h3 className="font-mono text-xl font-bold text-brand-primary">{selectedOrder.orderNumber}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)}><X size={20} /></button>
              </div>

              {/* Items List */}
              <div className="border border-brand-border rounded-xl p-4 bg-brand-surface/30 divide-y divide-brand-border/60">
                <p className="text-xs font-bold text-brand-text uppercase mb-2">Purchased Formulations</p>
                {selectedOrder.orderItems?.map((it, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={it.image} alt="" className="w-10 h-12 object-cover rounded bg-white border border-brand-border" />
                      <div>
                        <p className="font-semibold text-brand-text">{it.name}</p>
                        <p className="text-[11px] text-brand-muted">{it.variantTitle} (x{it.quantity})</p>
                      </div>
                    </div>
                    <span className="font-bold text-brand-primary">₹{it.total}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-extrabold text-sm text-brand-primary">
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-4 bg-white border border-brand-border rounded-xl text-xs space-y-1">
                <p className="font-bold text-brand-text mb-1 flex items-center space-x-1">
                  <MapPin size={14} className="text-brand-primary" />
                  <span>Customer & Shipping Address</span>
                </p>
                <p className="font-semibold text-brand-text">{selectedOrder.customerDetails?.name} ({selectedOrder.customerDetails?.phone})</p>
                <p>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.apartment}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}</p>
                {selectedOrder.customerNotes && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded mt-2">
                    <strong>Note:</strong> {selectedOrder.customerNotes}
                  </p>
                )}
              </div>

              {/* FULFILLMENT FORM */}
              <form onSubmit={handleUpdateOrder} className="space-y-4 text-xs pt-2 border-t border-brand-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Order Status</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg font-bold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text mb-1">Payment Status</label>
                    <select
                      value={editPaymentStatus}
                      onChange={e => setEditPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg font-bold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={editCourier}
                      onChange={e => setEditCourier(e.target.value)}
                      placeholder="e.g. Bluedart / Delhivery / DTDC"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text mb-1">Tracking AWB Number</label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={e => setEditTracking(e.target.value)}
                      placeholder="e.g. BD-894729103"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg shadow">
                    {isUpdating ? 'Updating...' : 'Save Fulfillment'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
