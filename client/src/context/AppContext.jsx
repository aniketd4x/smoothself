import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Store Settings
  const [settings, setSettings] = useState({
    brandName: 'SMOOTHSELF',
    logoUrl: '/logo.webp',
    tagline: '',
    announcementText: 'Free shipping order above ₹ 450',
    announcementActive: true,
    freeShippingThreshold: 450,
    standardShippingFee: 50,
    expressShippingFee: 100,
    contactEmail: 'care@smoothself.in',
    contactPhone: '+91 98765 43210',
    currencySymbol: '₹'
  });

  // User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ab_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('ab_token') || null;
  });

  // Cart State (Persistent in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ab_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && item.key && Number(item.price) > 0);
    } catch {
      return [];
    }
  });

  // Wishlist State (Array of product IDs)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ab_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('ab_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI Drawer / Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('ab_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('ab_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync appliedCoupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('ab_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('ab_coupon');
    }
  }, [appliedCoupon]);

  // Fetch Settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(console.error);
  }, []);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id ? null : prev));
    }, 3500);
  };

  // Cart Functions
  const addToCart = (product, quantity = 1, variant = null) => {
    if (!product) return;
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    const prodId = product._id || product.id || product.slug || 'prod-item';
    const prodName = product.name || 'SmoothSelf Lotion';
    const prodPrice = Number(variant?.price || product.price || 249);
    const prodComparePrice = Number(variant?.compareAtPrice || product.compareAtPrice || 299);
    const variantTitle = variant?.title || (product.variants?.[0]?.options?.[0]?.title) || 'Standard';
    const itemKey = `${prodId}-${variantTitle}`;
    const prodImage = product.images?.[0] || product.image || '/logo.webp';

    setCart(prevCart => {
      const safeCart = Array.isArray(prevCart) ? [...prevCart] : [];
      const existingIndex = safeCart.findIndex(item => item && item.key === itemKey);

      if (existingIndex > -1) {
        safeCart[existingIndex] = {
          ...safeCart[existingIndex],
          quantity: (Number(safeCart[existingIndex].quantity) || 0) + qty
        };
        return safeCart;
      } else {
        const newItem = {
          key: itemKey,
          productId: prodId,
          name: prodName,
          slug: product.slug || '',
          image: prodImage,
          price: prodPrice,
          compareAtPrice: prodComparePrice,
          quantity: qty,
          variantTitle,
          maxStock: Number(variant?.stock ?? product.stock ?? 99)
        };
        return [...safeCart, newItem];
      }
    });

    showToast(`Added "${prodName.slice(0, 30)}" to your bag!`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (key, delta) => {
    setCart(prev => {
      const safeCart = Array.isArray(prev) ? prev : [];
      return safeCart.map(item => {
        if (item && item.key === key) {
          const newQty = (Number(item.quantity) || 0) + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (key) => {
    setCart(prev => {
      const safeCart = Array.isArray(prev) ? prev : [];
      return safeCart.filter(item => item && item.key !== key);
    });
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations (Robust against NaNs and undefined)
  const safeCart = Array.isArray(cart) ? cart.filter(Boolean) : [];
  const cartSubtotal = safeCart.reduce((sum, item) => sum + (Number(item?.price || 0) * (Number(item?.quantity) || 1)), 0);
  const cartItemCount = safeCart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);

  // Free shipping progress
  const freeShippingThreshold = settings.freeShippingThreshold || 450;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const freeShippingDifference = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= (appliedCoupon.minOrderAmount || 0)) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount > 0 && discountAmount > appliedCoupon.maxDiscountAmount) {
        discountAmount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);
  }

  const shippingCost = isFreeShipping || cartSubtotal === 0 ? 0 : (settings.standardShippingFee || 50);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  // Wishlist Functions
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to Wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Auth Functions
  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('ab_user', JSON.stringify(userData));
    localStorage.setItem('ab_token', userToken);
    showToast(`Welcome back, ${userData.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ab_user');
    localStorage.removeItem('ab_token');
    showToast('Logged out successfully', 'info');
  };

  return (
    <AppContext.Provider value={{
      settings,
      setSettings,
      user,
      token,
      loginUser,
      logoutUser,
      isAdmin: user?.role === 'admin',
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
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
      wishlist,
      toggleWishlist,
      isInWishlist,
      isCartOpen,
      setIsCartOpen,
      isSearchOpen,
      setIsSearchOpen,
      quickViewProduct,
      setQuickViewProduct,
      toastMessage,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
