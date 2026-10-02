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
  Bell
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
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-brand-primary text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10">
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-serif font-bold text-lg tracking-wider">AURA ADMIN</span>
        </div>
        <Link to="/" target="_blank" className="p-1.5 hover:bg-white/10 rounded-lg">
          <ExternalLink size={18} />
        </Link>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-primary text-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Admin brand header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-purple-300 mb-0.5">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Commerce HQ</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                {settings.brandName || 'AURA BOTANICA'}
              </h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
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
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-white/80 hover:bg-white/10 transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink size={15} />
              <span>View Live Storefront</span>
            </span>
            <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded text-purple-200">Live</span>
          </Link>

          <button
            onClick={() => {
              logoutUser();
              navigate('/admin/login');
            }}
            className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 transition font-medium"
          >
            <LogOut size={15} />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
