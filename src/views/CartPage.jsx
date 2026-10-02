'use client';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

const CartPage = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    shippingCost,
    isFreeShipping,
    freeShippingThreshold,
    freeShippingDifference,
    freeShippingProgress,
    appliedCoupon,
    setAppliedCoupon,
    discountAmount,
    showToast
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

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
        showToast(`Coupon "${data.coupon.code}" applied!`);
      } else {
        showToast(data.message || 'Invalid coupon', 'error');
      }
    } catch {
      showToast('Error validating coupon', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-surface flex items-center justify-center text-brand-muted mx-auto mb-4">
          <ShoppingBag size={36} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-brand-primary mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-brand-muted mb-8 max-w-sm mx-auto">
          You haven't added any botanical formulations to your bag yet.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-brand-primary text-white text-xs font-semibold rounded-full shadow hover:bg-brand-hover transition"
        >
          Explore Bestsellers
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary mb-8 text-center md:text-left">
          Shopping Cart ({cart.length} items)
        </h1>

        {/* Free shipping goal bar */}
        <div className="bg-brand-surface p-4 rounded-xl border border-brand-border/60 mb-8 max-w-xl">
          <div className="flex items-center space-x-2 text-xs font-medium mb-2 text-brand-primary">
            <Truck size={16} />
            {isFreeShipping ? (
              <span className="font-bold text-emerald-700">🎉 Congratulations! You have qualified for Free Express Delivery!</span>
            ) : (
              <span>Add <strong className="text-brand-sale">₹{freeShippingDifference}</strong> more to get <strong>Free Shipping</strong>!</span>
            )}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ITEMS LIST (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="border border-brand-border rounded-xl overflow-hidden divide-y divide-brand-border/60">
              {cart.map((item) => (
                <div key={item.key} className="p-4 sm:p-6 flex items-center space-x-4">
                  <Link to={`/product/${item.slug}`} className="w-20 h-24 rounded-lg overflow-hidden bg-brand-surface border border-brand-border flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-brand-primary hover:underline line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-brand-muted mt-0.5">Variant: {item.variantTitle}</p>
                    <p className="text-xs font-bold text-brand-primary mt-1">₹{item.price} each</p>

                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center border border-brand-border rounded-md bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.key, -1)}
                          className="px-2.5 py-1 text-brand-text hover:text-brand-primary"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.key, 1)}
                          className="px-2.5 py-1 text-brand-text hover:text-brand-primary"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-gray-400 hover:text-red-500 text-xs flex items-center space-x-1"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-brand-primary">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Link to="/shop" className="text-xs font-semibold text-brand-primary hover:underline">
                ← Continue Browsing Formulations
              </Link>
            </div>
          </div>

          {/* SUMMARY SIDEBAR (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <div className="bg-brand-surface/40 p-6 sm:p-8 rounded-xl border border-brand-border space-y-6">
              <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3">
                Order Summary
              </h3>

              {/* Coupon box */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                      <Tag size={14} />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> (-₹{discountAmount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 px-3 py-2 bg-white border border-brand-border rounded-lg text-xs uppercase focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price details */}
              <div className="space-y-2 text-xs text-brand-muted border-t border-brand-border pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-text">₹{cartSubtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-brand-text">
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-brand-primary pt-3 border-t border-brand-border">
                  <span>Estimated Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm rounded-xl shadow-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;
