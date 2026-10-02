import React, { useState } from 'react';
import { Truck, Search, CheckCircle2, AlertCircle } from 'lucide-react';

const OrderTrackingPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (res.ok && data && data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found. Please verify the order number (e.g. AB-123456-789).');
      }
    } catch {
      setError('Unable to track order right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-10">
          <Truck size={36} className="mx-auto text-brand-primary mb-3" />
          <h1 className="font-serif text-3xl font-bold text-brand-primary">Track Your Consignment</h1>
          <p className="text-xs text-brand-muted mt-2">
            Enter the Order Number sent to your email or SMS upon checkout.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-8">
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="e.g. AB-948123-456"
            className="flex-1 px-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-brand-primary"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow transition"
          >
            {isLoading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="p-6 bg-brand-surface rounded-2xl border border-brand-border space-y-4 animate-fade-in">
            <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
              <div>
                <span className="text-xs text-brand-muted">Order ID</span>
                <p className="font-mono font-bold text-brand-primary text-sm">{order.orderNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-purple-100 text-brand-primary'
              }`}>
                {order.orderStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-brand-muted">Placed Date:</p>
                <p className="font-semibold">{new Date(order.placedAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-brand-muted">Courier Partner:</p>
                <p className="font-semibold">{order.courier || 'Bluedart Express'}</p>
              </div>
              {order.trackingNumber && (
                <div className="col-span-2">
                  <p className="text-brand-muted">Waybill / Tracking AWB:</p>
                  <p className="font-mono font-bold text-brand-primary">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-brand-border/60">
              <p className="text-xs text-brand-muted mb-2 font-semibold">Ordered Items ({order.orderItems?.length})</p>
              <div className="space-y-2">
                {order.orderItems?.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{it.name} (x{it.quantity})</span>
                    <span className="font-bold">₹{it.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderTrackingPage;
