'use client';
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Image,
  BookOpen,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, token, logoutUser, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('ab_token');
      const savedUser = localStorage.getItem('ab_user');
      let parsedUser = null;
      try { parsedUser = savedUser ? JSON.parse(savedUser) : null; } catch {}
      if (!savedToken || parsedUser?.role !== 'admin') {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [navigate]);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Banners & Sliders', path: '/admin/banners', icon: Image },
    { name: 'Blog Journal', path: '/admin/blog', icon: BookOpen },
    { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* MOBILE STICKY TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-brand-primary text-white px-3.5 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation drawer"
            className="p-2 -ml-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-purple-300 flex-shrink-0" />
            <span className="font-serif font-bold text-base tracking-wider truncate max-w-[170px]">
              {settings?.brandName || 'SMOOTHSELF'}
            </span>
            <span className="text-[10px] font-sans font-bold bg-white/15 px-1.5 py-0.5 rounded text-white/90">
              ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Link
            to="/"
            target="_blank"
            title="View Live Storefront"
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg text-white/90 transition flex items-center space-x-1 text-xs"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Store</span>
          </Link>
          <button
            onClick={() => {
              logoutUser();
              navigate('/admin/login');
            }}
            title="Sign out"
            className="p-2 text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR NAVIGATION (DRAWER ON MOBILE, STATIC ON DESKTOP) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-brand-primary text-white flex flex-col justify-between transform transition-transform duration-250 ease-in-out md:translate-x-0 md:static md:w-64 md:z-auto ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Admin Brand Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-purple-300 mb-0.5">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Commerce HQ</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-white tracking-wide truncate">
                {settings?.brandName || 'SMOOTHSELF'}
              </h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] overscroll-contain">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition active:scale-[0.99] ${
                    isActive
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={17} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-brand-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs text-white/80 hover:bg-white/10 transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink size={15} />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded text-purple-200">Live</span>
          </Link>

          <button
            onClick={() => {
              logoutUser();
              navigate('/admin/login');
            }}
            className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 transition font-medium"
          >
            <LogOut size={15} />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 min-w-0 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-20 md:pb-8">
        {children || <Outlet />}
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {[
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
          { name: 'Products', path: '/admin/products', icon: Package },
          { name: 'Settings', path: '/admin/settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition active:scale-95 ${
                isActive ? 'text-brand-primary font-bold' : 'text-gray-500 hover:text-brand-primary'
              }`}
            >
              <div className={`p-1 rounded-md transition ${isActive ? 'bg-brand-primary/10 text-brand-primary' : ''}`}>
                <Icon size={18} />
              </div>
              <span className="mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition active:scale-95 ${
            isSidebarOpen ? 'text-brand-primary font-bold' : 'text-gray-500 hover:text-brand-primary'
          }`}
        >
          <div className={`p-1 rounded-md transition ${isSidebarOpen ? 'bg-brand-primary/10 text-brand-primary' : ''}`}>
            <Menu size={18} />
          </div>
          <span className="mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
