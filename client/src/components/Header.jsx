import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, ChevronDown, ShieldCheck } from 'lucide-react';

const Header = () => {
  const {
    settings,
    cartItemCount,
    cartSubtotal,
    setIsCartOpen,
    setIsSearchOpen,
    wishlist,
    user,
    logoutUser,
    isAdmin
  } = useApp();

  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Strawberry Lotion', path: '/product/strawberry-lotion' },
    { name: 'Vanilla Lotion', path: '/product/vanilla-body-lotion' },
    { name: 'About Us', path: '/about' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className="w-full relative z-40">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {isAnnouncementVisible && settings.announcementActive !== false && (
        <div className="bg-brand-sale text-white text-xs md:text-sm py-2 px-4 flex items-center justify-between tracking-wide font-medium transition-all duration-300">
          <div className="w-6 hidden md:block"></div>
          <div className="flex-1 text-center flex items-center justify-center space-x-2">
            <span>✨</span>
            <span className="font-semibold">{settings.announcementText || 'Free shipping order above ₹ 450'}</span>
            <span>✨</span>
          </div>
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="text-white hover:text-white/80 p-1 transition"
            aria-label="Close Announcement"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 2. MAIN NAVIGATION BAR (STICKY) */}
      <nav
        className={`w-full bg-white transition-all duration-300 border-b border-brand-border ${
          isScrolled ? 'sticky top-0 shadow-sticky py-3' : 'py-4 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-brand-primary p-2 hover:bg-brand-surface rounded-md transition"
                aria-label="Open Navigation Menu"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-brand-primary p-2 hover:bg-brand-surface rounded-md transition ml-1"
                aria-label="Search"
              >
                <Search size={21} />
              </button>
            </div>

            {/* BRAND LOGO */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link to="/" className="inline-flex items-center group py-1">
                <img
                  src={settings.logoUrl || '/logo.webp'}
                  alt={settings.brandName || 'SmoothSelf'}
                  className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform duration-200 group-hover:opacity-90"
                />
              </Link>
            </div>

            {/* DESKTOP NAVIGATION LINKS */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path.includes('?') && location.search === link.path.split('?')[1]);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-[15px] font-medium transition duration-200 relative py-1 ${
                      isActive ? 'text-brand-primary font-semibold' : 'text-brand-text hover:text-brand-primary'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-primary rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* RIGHT UTILITY ICONS */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Desktop Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center space-x-2 text-brand-text hover:text-brand-primary p-2 rounded-full hover:bg-brand-surface transition"
                aria-label="Search"
              >
                <Search size={20} />
                <span className="text-xs text-brand-muted hidden xl:inline">Search</span>
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative text-brand-text hover:text-brand-primary p-2 rounded-full hover:bg-brand-surface transition"
                aria-label="Wishlist"
              >
                <Heart size={21} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-sale text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User Account / Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-brand-text hover:text-brand-primary p-2 rounded-full hover:bg-brand-surface transition"
                  aria-label="Account"
                >
                  <UserIcon size={21} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-brand-border py-2 z-50 animate-fade-in text-sm">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-brand-border">
                          <p className="font-semibold text-brand-primary truncate">{user.name}</p>
                          <p className="text-xs text-brand-muted truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 hover:bg-brand-surface text-brand-text"
                        >
                          My Profile & Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-brand-surface text-brand-primary font-medium"
                          >
                            <ShieldCheck size={16} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logoutUser();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-brand-border">
                          <p className="font-semibold text-brand-primary">Welcome to Aura</p>
                          <p className="text-xs text-brand-muted">Sign in to track orders</p>
                        </div>
                        <Link
                          to="/account?tab=login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 hover:bg-brand-surface text-brand-text"
                        >
                          Customer Login
                        </Link>
                        <Link
                          to="/account?tab=register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 hover:bg-brand-surface text-brand-text"
                        >
                          Create Account
                        </Link>
                        <div className="border-t border-brand-border my-1"></div>
                        <Link
                          to="/admin/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 hover:bg-brand-surface text-xs text-brand-muted hover:text-brand-primary"
                        >
                          Store Admin Login
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Bag Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 bg-brand-surface hover:bg-brand-primary hover:text-white px-3 py-2 rounded-full transition duration-200 group"
                aria-label="Open Shopping Bag"
              >
                <div className="relative">
                  <ShoppingBag size={20} className="text-brand-primary group-hover:text-white transition" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-sale text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-brand-primary group-hover:text-white transition">
                  ₹{cartSubtotal}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE SLIDE-OUT MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="inline-block">
                  <img
                    src={settings.logoUrl || '/logo.webp'}
                    alt={settings.brandName || 'SmoothSelf'}
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-brand-text hover:text-brand-primary"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-6 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-lg font-medium text-brand-text hover:text-brand-primary py-2 border-b border-brand-border/40"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/track-order"
                  className="text-lg font-medium text-brand-text hover:text-brand-primary py-2 border-b border-brand-border/40"
                >
                  Track Order
                </Link>
                <Link
                  to="/faq"
                  className="text-lg font-medium text-brand-text hover:text-brand-primary py-2"
                >
                  FAQs & Support
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-border">
              {user ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-brand-primary">Logged in as {user.name}</p>
                  <Link
                    to="/account"
                    className="block text-center py-2.5 bg-brand-primary text-white rounded-md text-sm font-medium"
                  >
                    View Account & Orders
                  </Link>
                  <button
                    onClick={logoutUser}
                    className="w-full text-center py-2 text-sm text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/account?tab=login"
                    className="text-center py-2.5 bg-brand-surface text-brand-primary border border-brand-border rounded-md text-sm font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/account?tab=register"
                    className="text-center py-2.5 bg-brand-primary text-white rounded-md text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
