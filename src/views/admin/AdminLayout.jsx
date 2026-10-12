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
  ChevronRight,
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logoutUser, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = location.pathname === '/admin/login';

  React.useEffect(() => {
    if (isLoginPage) return;
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('ab_token');
      const savedUser = localStorage.getItem('ab_user');
      let parsedUser = null;
      try {
        parsedUser = savedUser ? JSON.parse(savedUser) : null;
      } catch {}
      if (!savedToken || parsedUser?.role !== 'admin') {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [navigate, isLoginPage]);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile drawer is open
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  if (isLoginPage) {
    return (
      <div className="admin-root min-h-screen bg-[#F5F5F5] text-[#111111] font-admin antialiased">
        {children || <Outlet />}
      </div>
    );
  }

  const navGroups = [
    {
      label: 'Overview',
      items: [{ name: 'Dashboard', path: '/admin', icon: LayoutDashboard }],
    },
    {
      label: 'Catalog & Inventory',
      items: [
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
      ],
    },
    {
      label: 'Sales & Customers',
      items: [
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Coupons', path: '/admin/coupons', icon: Tag },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
      ],
    },
    {
      label: 'Content & Marketing',
      items: [
        { name: 'Banners & Sliders', path: '/admin/banners', icon: Image },
        { name: 'Blog Journal', path: '/admin/blog', icon: BookOpen },
        { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { name: 'Store Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const currentNav =
    allNavItems.find((item) => item.path === location.pathname) ||
    allNavItems[0];

  const adminInitial = (user?.name || 'Admin').charAt(0).toUpperCase();

  return (
    <div className="admin-root min-h-screen bg-[#F5F5F5] text-[#111111] font-admin antialiased flex flex-col lg:flex-row">
      {/* MOBILE & TABLET STICKY TOP HEADER */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E5E5E5] px-3.5 sm:px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation drawer"
            aria-expanded={isSidebarOpen}
            className="w-11 h-11 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            to="/admin"
            className="flex items-center gap-2 min-w-0"
          >
            <img
              src={settings?.logoUrl || '/logo.webp'}
              alt=""
              className="w-7 h-7 rounded-md object-contain bg-[#F5F5F5] border border-[#E5E5E5] p-0.5 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold text-sm tracking-tight text-[#111111] truncate max-w-[140px] sm:max-w-[200px]">
              {settings?.brandName || 'SMOOTHSELF'}
            </span>
            <span className="text-[10px] font-semibold bg-[#111111] text-white px-1.5 py-0.5 rounded tracking-wider uppercase flex-shrink-0">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            to="/"
            target="_blank"
            title="View Live Storefront"
            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[#111111] transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Storefront</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logoutUser();
              navigate('/admin/login');
            }}
            title="Sign out"
            aria-label="Sign out"
            className="w-10 h-10 rounded-lg border border-[#E5E5E5] bg-white text-[#6B7280] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR NAVIGATION (DRAWER ON MOBILE/TABLET, STATIC ON DESKTOP) */}
      <aside
        aria-label="Admin Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[#E5E5E5] text-[#111111] flex flex-col justify-between transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:w-64 lg:z-auto lg:h-screen lg:sticky lg:top-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#E5E5E5] flex items-center justify-between flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#111111] truncate">
                  {settings?.brandName || 'SMOOTHSELF'}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] rounded">
                  HQ
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-none mt-0.5 truncate">
                Commerce Admin
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-9 h-9 rounded-lg border border-[#E5E5E5] text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F5] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-5 overflow-y-auto overscroll-contain">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between min-h-[44px] lg:min-h-[38px] px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[#111111] text-white font-semibold'
                        : 'text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#111111] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={16}
                        className={`flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-[#6B7280]'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight
                        size={14}
                        className="text-white/80 flex-shrink-0"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-[#E5E5E5] bg-[#F5F5F5]/60 space-y-2 flex-shrink-0">
          <div className="px-3 py-2.5 rounded-lg bg-white border border-[#E5E5E5] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {adminInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#111111] truncate">
                {user?.name || 'Store Administrator'}
              </p>
              <p className="text-[11px] text-[#6B7280] truncate">
                {user?.email || 'admin@smoothself.in'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              target="_blank"
              className="min-h-[40px] px-3 py-2 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#111111] text-xs font-medium text-[#111111] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Storefront</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                navigate('/admin/login');
              }}
              className="min-h-[40px] px-3 py-2 rounded-lg bg-white border border-[#E5E5E5] hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-xs font-medium text-[#111111] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* DESKTOP TOP UTILITY HEADER */}
        <header className="hidden lg:flex h-16 bg-white border-b border-[#E5E5E5] px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280] font-medium">Admin Portal</span>
            <ChevronRight size={14} className="text-[#6B7280]" />
            <span className="font-semibold text-[#111111]">
              {currentNav?.name || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white border border-[#111111] text-[#111111] hover:bg-[#F5F5F5] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View Live Store</span>
              <ExternalLink size={13} />
            </Link>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                navigate('/admin/login');
              }}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F5F5F5] text-xs font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-[1400px] w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E5E5] px-1.5 py-1 flex items-center justify-around"
      >
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
              className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 rounded-lg text-[11px] transition-colors ${
                isActive
                  ? 'text-[#111111] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111111] font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-[#111111] text-white' : ''
                }`}
              >
                <Icon size={16} />
              </div>
              <span className="mt-0.5 leading-none">{tab.name}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
            isSidebarOpen
              ? 'text-[#111111] font-semibold'
              : 'text-[#6B7280] hover:text-[#111111] font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              isSidebarOpen ? 'bg-[#111111] text-white' : ''
            }`}
          >
            <Menu size={16} />
          </div>
          <span className="mt-0.5 leading-none">Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
