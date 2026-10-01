import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, Tag, Check, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    cartItemCount,
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
  const [orderNote, setOrderNote] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

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
        showToast(`Coupon "${data.coupon.code}" applied! You saved ₹${data.coupon.discountAmount}`);
      } else {
        showToast(data.message || 'Invalid coupon code', 'error');
      }
    } catch {
      showToast('Error validating coupon', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-drawer flex flex-col justify-between animate-slide-in-right">
          
          {/* 1. DRAWER HEADER */}
          <div className="p-6 border-b border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={20} className="text-brand-primary" />
                <h3 className="font-serif text-xl font-bold text-brand-primary">
                  Shopping Cart ({cartItemCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-brand-muted hover:text-brand-primary p-1.5 rounded-full hover:bg-brand-surface transition"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* FREE SHIPPING PROGRESS BAR */}
            <div className="bg-brand-surface p-3.5 rounded-lg border border-brand-border/60">
              <div className="flex items-center space-x-2 text-xs font-medium mb-2 text-brand-primary">
                <Truck size={16} className="text-brand-primary" />
                {isFreeShipping ? (
                  <span className="font-semibold text-emerald-700">🎉 Congratulations! You unlocked Free Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="text-brand-sale">₹{freeShippingDifference}</strong> more to get <strong>Free Shipping</strong>!
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2. CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center text-brand-muted mb-4">
                  <ShoppingBag size={30} />
                </div>
                <h4 className="font-serif text-lg font-semibold text-brand-primary mb-1">
                  Your cart is empty
                </h4>
                <p className="text-xs text-brand-muted max-w-xs mb-6">
                  Explore our luxury botanical skincare and body elixirs to fill your bag.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded-full transition"
                >
                  Shop Bestsellers
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.key}
                  className="flex space-x-4 pb-4 border-b border-brand-border/60 last:border-0"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="w-20 h-24 bg-brand-surface rounded-md overflow-hidden flex-shrink-0 border border-brand-border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center hover:scale-105 transition duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-medium text-brand-text hover:text-brand-primary line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="text-gray-400 hover:text-red-500 p-1 transition ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Variant: {item.variantTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-brand-border rounded-md bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.key, -1)}
                          className="p-1.5 text-brand-text hover:text-brand-primary hover:bg-brand-surface rounded-l-md transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-brand-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.key, 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-brand-text hover:text-brand-primary hover:bg-brand-surface rounded-r-md transition disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-brand-primary">
                          ₹{item.price * item.quantity}
                        </span>
                        {item.compareAtPrice > item.price && (
                          <span className="block text-[11px] text-gray-400 line-through">
                            ₹{item.compareAtPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. DRAWER FOOTER (CHECKOUT & PROMO) */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-brand-border bg-brand-surface/40 space-y-4">
              {/* COUPON CODE ACCORDION */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-medium">
                      <Tag size={14} />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{discountAmount})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 font-semibold text-xs ml-2"
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
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-2 bg-white border border-brand-border rounded-md text-xs uppercase focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-md transition disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="space-y-1.5 text-xs text-brand-muted pt-2 border-t border-brand-border/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-text">₹{cartSubtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-brand-text">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">Free</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-brand-primary pt-2 border-t border-brand-border">
                  <span>Estimated Total</span>
                  <span className="text-base font-extrabold text-brand-primary">₹{cartTotal}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center">Taxes and shipping calculated at checkout</p>
              </div>

              {/* CHECKOUT BUTTON */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-lg text-sm transition duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={17} />
                </button>
                <div className="text-center">
                  <Link
                    to="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs text-brand-muted hover:text-brand-primary underline transition"
                  >
                    View Shopping Cart Details
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
