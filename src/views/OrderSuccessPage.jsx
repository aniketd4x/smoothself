'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, Printer, ArrowRight, Truck } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [isLoading, setIsLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderNumber) {
      fetch(`/api/orders/track/${orderNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setOrder(data.order);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [orderNumber, order]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Celebration Header */}
        <div className="text-center space-y-3 pb-8 border-b border-brand-border">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed & Placed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
            We’ve received your order and our laboratory is preparing your fresh botanical formulations for dispatch.
          </p>
          <div className="pt-2">
            <span className="text-xs text-brand-muted">Order Number: </span>
            <strong className="text-sm font-mono text-brand-primary bg-brand-surface px-3 py-1 rounded border border-brand-border">
              {orderNumber || order?.orderNumber}
            </strong>
          </div>
        </div>

        {/* Order Tracking Timeline */}
        <div className="my-8 p-6 bg-brand-surface rounded-xl border border-brand-border">
          <h3 className="font-serif text-base font-bold text-brand-primary mb-4 flex items-center space-x-2">
            <Truck size={18} className="text-brand-primary" />
            <span>Fulfillment Status</span>
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center mx-auto text-xs font-bold">1</div>
              <p className="font-bold text-brand-primary">Placed</p>
              <p className="text-[10px] text-brand-muted">Confirmed</p>
            </div>
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center mx-auto text-xs font-bold animate-pulse">2</div>
              <p className="font-bold text-brand-primary">Preparing</p>
              <p className="text-[10px] text-brand-muted">In Lab</p>
            </div>
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto text-xs font-bold">3</div>
              <p className="text-gray-400">Shipped</p>
              <p className="text-[10px] text-gray-400">24-48h</p>
            </div>
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto text-xs font-bold">4</div>
              <p className="text-gray-400">Delivered</p>
              <p className="text-[10px] text-gray-400">2-5 Days</p>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="p-6 md:p-8 bg-white rounded-xl border border-brand-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="font-serif text-lg font-bold text-brand-primary">
                Order Receipt & Details
              </h3>
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-surface hover:bg-brand-border/60 text-xs font-semibold text-brand-primary rounded border border-brand-border transition"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
            </div>

            {/* Items table */}
            <div className="divide-y divide-brand-border/60">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt="" className="w-12 h-14 object-cover rounded bg-brand-surface border border-brand-border" />
                    <div>
                      <h4 className="text-xs font-bold text-brand-text">{item.name}</h4>
                      <p className="text-[11px] text-brand-muted">Qty: {item.quantity} • {item.variantTitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-primary">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-brand-muted pt-4 border-t border-brand-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-text">₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({order.shippingMethod})</span>
                <span className="font-semibold text-brand-text">{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-brand-primary pt-3 border-t border-brand-border">
                <span>Total Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Delivery address info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-border text-xs text-brand-muted">
              <div>
                <p className="font-bold text-brand-text mb-1 flex items-center space-x-1">
                  <MapPin size={13} className="text-brand-primary" />
                  <span>Delivery Address</span>
                </p>
                <p className="text-brand-text font-medium">{order.customerDetails?.name}</p>
                <p>{order.shippingAddress?.street}, {order.shippingAddress?.apartment}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                <p>Phone: {order.customerDetails?.phone}</p>
              </div>

              <div>
                <p className="font-bold text-brand-text mb-1">Payment Method</p>
                <p className="text-brand-text font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Secure Online Payment'}</p>
                <p className="mt-2 font-bold text-brand-text">Need Assistance?</p>
                <p>Email: <a href="mailto:support@smoothself.in" className="text-brand-primary underline">support@smoothself.in</a></p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home CTA */}
        <div className="text-center mt-10 space-x-4">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-full shadow transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
