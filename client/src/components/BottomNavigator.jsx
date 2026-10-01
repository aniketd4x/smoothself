import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';

const BottomNavigator = () => {
  const location = useLocation();
  const {
    cartItemCount,
    cartSubtotal,
    setIsCartOpen,
    setIsSearchOpen,
    wishlist
  } = useApp();

  // Hide on admin routes or checkout page
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const isHome = location.pathname === '/';
  const isShop = location.pathname.startsWith('/shop');
  const isWishlist = location.pathname === '/wishlist';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2">
      <div className="grid grid-cols-5 items-center text-center">
        
        {/* 1. HOME */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 transition ${
            isHome ? 'text-brand-primary font-bold' : 'text-brand-muted hover:text-brand-primary'
          }`}
        >
          <Home size={20} className={isHome ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </Link>

        {/* 2. SHOP */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center py-1 transition ${
            isShop ? 'text-brand-primary font-bold' : 'text-brand-muted hover:text-brand-primary'
          }`}
        >
          <Compass size={20} className={isShop ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] mt-1 tracking-tight">Shop</span>
        </Link>

        {/* 3. SEARCH */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-brand-muted hover:text-brand-primary transition"
          aria-label="Search"
        >
          <Search size={20} className="stroke-2" />
          <span className="text-[10px] mt-1 tracking-tight">Search</span>
        </button>

        {/* 4. WISHLIST */}
        <Link
          to="/wishlist"
          className={`flex flex-col items-center justify-center py-1 relative transition ${
            isWishlist ? 'text-brand-primary font-bold' : 'text-brand-muted hover:text-brand-primary'
          }`}
        >
          <div className="relative">
            <Heart size={20} className={isWishlist ? 'stroke-[2.5]' : 'stroke-2'} fill={isWishlist ? 'currentColor' : 'none'} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-sale text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Wishlist</span>
        </Link>

        {/* 5. CART DRAWER TRIGGER */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 relative text-brand-muted hover:text-brand-primary transition"
          aria-label="Open Cart"
        >
          <div className="relative">
            <ShoppingBag size={20} className="stroke-2 text-brand-primary" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-sale text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold text-brand-primary">
            {cartItemCount > 0 ? `₹${cartSubtotal}` : 'Bag'}
          </span>
        </button>

      </div>
    </nav>
  );
};

export default BottomNavigator;
