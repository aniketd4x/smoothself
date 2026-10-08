import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Truck, ArrowLeft, Tag, Check, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const CheckoutPage = () => {
  const {
    cart,
    clearCart,
    cartSubtotal,
    cartTotal,
    shippingCost,
    appliedCoupon,
    setAppliedCoupon,
    discountAmount,
    user,
    token,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    apartment: user?.addresses?.[0]?.apartment || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'Karnataka',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: 'India',
    customerNotes: ''
  });

  const [shippingMethod, setShippingMethod] = useState('Standard Delivery');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // If cart is empty, redirect to shop
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: cartSubtotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
        showToast(`Coupon "${data.coupon.code}" applied! Saved ₹${data.coupon.discountAmount}`);
      } else {
        showToast(data.message || 'Invalid coupon code', 'error');
      }
    } catch {
      showToast('Error validating coupon', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your bag is empty. Please add products first.', 'error');
      return;
    }

    if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
      showToast('Please complete all contact details (Name, Email, Phone).', 'error');
      return;
    }

    if (!formData.street?.trim() || !formData.city?.trim() || !formData.postalCode?.trim()) {
      showToast('Please provide your complete delivery address (Street, City, Pincode).', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build shared order payload
      const orderPayload = {
        customerDetails: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        },
        shippingAddress: {
          street: formData.street.trim(),
          apartment: formData.apartment ? formData.apartment.trim() : '',
          city: formData.city.trim(),
          state: formData.state || 'Karnataka',
          postalCode: formData.postalCode.trim(),
          country: formData.country || 'India'
        },
        orderItems: cart.map(item => ({
          product: item.productId,
          name: item.name,
          slug: item.slug || '',
          image: item.image,
          variantTitle: item.variantTitle || 'Standard',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        })),
        shippingMethod,
        shippingCost,
        subtotal: cartSubtotal,
        discountAmount,
        couponCode: appliedCoupon?.code || '',
        taxAmount: 0,
        totalAmount: cartTotal,
        paymentMethod,
        customerNotes: formData.customerNotes ? formData.customerNotes.trim() : ''
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // ── ONLINE PAYMENT via Razorpay ──────────────────────────────────────
      if (paymentMethod === 'ONLINE') {
        // 1. Create a Razorpay order on the backend
        const rzpOrderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers,
          body: JSON.stringify({ amount: cartTotal, currency: 'INR', receipt: `ss_${Date.now()}` })
        });
        const rzpOrderData = await rzpOrderRes.json();

        if (!rzpOrderData.success) {
          showToast(rzpOrderData.message || 'Could not initiate payment. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }

        // 2. Open the Razorpay checkout popup
        const rzpOptions = {
          key: rzpOrderData.keyId,
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency,
          name: 'SmoothSelf',
          description: `Order of ${cart.length} item(s)`,
          order_id: rzpOrderData.orderId,
          prefill: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            contact: formData.phone.trim()
          },
          theme: { color: '#6b3fa0' },
          handler: async (response) => {
            try {
              // 3. Verify payment signature on the backend
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();

              if (!verifyData.success) {
                showToast('Payment verification failed. Please contact support.', 'error');
                setIsSubmitting(false);
                return;
              }

              // 4. Save the order in Supabase as Paid
              const finalPayload = {
                ...orderPayload,
                paymentMethod: 'ONLINE',
                paymentStatus: 'Paid',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              };

              const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers,
                body: JSON.stringify(finalPayload)
              });
              const orderData = await orderRes.json();

              if (orderData.success && orderData.order) {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                clearCart();
                showToast('Payment successful! Order placed.');
                navigate(`/order-success/${orderData.order.orderNumber}`, { state: { order: orderData.order } });
              } else {
                showToast(orderData?.message || 'Payment done but order save failed. Contact support with Payment ID: ' + response.razorpay_payment_id, 'error');
              }
            } catch (err) {
              showToast('Error finalizing order: ' + err.message, 'error');
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              showToast('Payment cancelled.', 'error');
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
        return; // setIsSubmitting(false) is handled inside handler/ondismiss
      }

      // ── CASH ON DELIVERY ─────────────────────────────────────────────────
      let data = null;
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify(orderPayload)
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
        }
      } catch (netErr) {
        console.warn('[Order Network Warning]:', netErr.message);
      }

      if (data && data.success && data.order) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        clearCart();
        showToast('Order placed successfully! We are preparing your shipment.');
        navigate(`/order-success/${data.order.orderNumber}`, { state: { order: data.order } });
        return;
      } else {
        showToast(data?.message || 'Could not place order. Please review your details and try again.', 'error');
        return;
      }
    } catch (err) {
      console.error('[Order Submit Catch]', err);
      showToast('Error processing order. Please check your information.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-brand-surface/40 min-h-screen py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/cart" className="inline-flex items-center space-x-1 text-xs text-brand-muted hover:text-brand-primary font-medium">
            <ArrowLeft size={14} />
            <span>Return to Shopping Bag</span>
          </Link>
          <span className="text-xs font-semibold text-brand-primary">Secure 256-Bit SSL Checkout</span>
        </div>

        <form onSubmit={handleOrderSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: CUSTOMER & SHIPPING (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* 1. CONTACT INFORMATION */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-sm">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-primary mb-4">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Phone Number (For Order Tracking &amp; Updates) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98200 12345"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-brand-text mb-1">Email Address (Order Confirmation) *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. priya.sharma@example.com"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SHIPPING ADDRESS */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-sm">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-primary mb-4">
                  2. Shipping Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Street Address, Locality *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="e.g. 402, Highgrove Apartments, Indiranagar 100ft Road"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Apartment, Floor, Landmark (Optional)</label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="e.g. Block B, Near Toit Brewpub"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-text mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-text mb-1">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                      >
                        {['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana', 'Gujarat', 'West Bengal', 'Kerala', 'Rajasthan', 'Uttar Pradesh', 'Goa', 'Punjab', 'Other'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-text mb-1">Pincode *</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        maxLength={6}
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 560038"
                        className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Delivery Instructions / Notes (Optional)</label>
                    <textarea
                      rows={2}
                      name="customerNotes"
                      value={formData.customerNotes}
                      onChange={handleInputChange}
                      placeholder="e.g. Please leave with security guard if unavailable"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PAYMENT METHOD */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-sm">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-primary mb-4">
                  3. Payment Method
                </h3>
                
                <div className="space-y-3">
                  {/* COD (Disabled) */}
                  <div className="flex items-start space-x-3 p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 opacity-60 cursor-not-allowed">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      disabled
                      checked={false}
                      className="mt-1 text-gray-400 cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Banknote size={18} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-500">Cash on Delivery (COD)</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Disabled</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cash on Delivery is currently disabled. Please checkout securely via online payment.
                      </p>
                    </div>
                  </div>

                  {/* Razorpay Online Payment */}
                  <label className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'ONLINE'
                      ? 'border-brand-primary bg-purple-50/40 ring-1 ring-brand-primary'
                      : 'border-brand-border hover:bg-brand-surface'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={18} className="text-brand-primary" />
                        <span className="text-sm font-bold text-brand-primary">UPI / Credit &amp; Debit Cards / NetBanking</span>
                      </div>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Instant secure checkout via Razorpay — Google Pay, PhonePe, Paytm, Cards &amp; NetBanking.
                      </p>
                      {paymentMethod === 'ONLINE' && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-4 h-4" />
                          <span className="text-[10px] text-brand-muted font-medium">Powered by Razorpay · 100% Secure</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-sm sticky top-24 space-y-6">
                <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3">
                  Order Summary ({cart.length} items)
                </h3>

                {/* Items List */}
                <div className="divide-y divide-brand-border/60 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.key} className="py-3 flex items-center space-x-3">
                      <div className="relative w-14 h-16 rounded-md overflow-hidden bg-brand-surface flex-shrink-0 border border-brand-border">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                        <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-brand-text truncate">{item.name}</p>
                        <p className="text-[11px] text-brand-muted">{item.variantTitle}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-primary">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* COUPON INPUT */}
                <div className="pt-2 border-t border-brand-border">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                      <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                        <Tag size={14} />
                        <span>Coupon <strong>{appliedCoupon.code}</strong> (-₹{discountAmount})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Discount code (e.g. WELCOME10)"
                        className="flex-1 px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs uppercase focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* PRICE CALCULATION BREAKDOWN */}
                <div className="space-y-2 text-xs text-brand-muted pt-2 border-t border-brand-border">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-brand-text">₹{cartSubtotal}.00</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount}.00</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-brand-text">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase">Free</span>
                      ) : (
                        `₹${shippingCost}.00`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-brand-primary pt-3 border-t border-brand-border">
                    <span>Total Amount</span>
                    <span className="text-lg">₹{cartTotal}.00</span>
                  </div>
                  <p className="text-[10px] text-gray-400">All prices include GST taxes.</p>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <ShieldCheck size={18} />
                  <span>
                    {isSubmitting
                      ? (paymentMethod === 'ONLINE' ? 'Opening Payment...' : 'Processing Your Order...')
                      : (paymentMethod === 'ONLINE' ? `Pay Now • ₹${cartTotal}` : `Place Order • ₹${cartTotal}`)}
                  </span>
                </button>

                <div className="text-center text-[11px] text-brand-muted space-y-1">
                  <p>🔒 100% Guaranteed Safe &amp; Encrypted Checkout</p>
                  <p>7-Day Hassle-Free Replacement for Damaged Items</p>
                </div>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default CheckoutPage;
