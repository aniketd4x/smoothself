'use client';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  Loader2,
} from 'lucide-react';

const AdminLogin = () => {
  const { loginUser, showToast, settings } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        loginUser(data.user, data.token);
        showToast('Admin authenticated successfully!');
        navigate('/admin');
      } else {
        const message =
          data.message || 'Unauthorized: Admin privileges required';
        setErrorMsg(message);
        showToast(message, 'error');
      }
    } catch {
      const fallbackError =
        'Could not sign in as admin. Please check your credentials.';
      setErrorMsg(fallbackError);
      showToast(fallbackError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-root min-h-screen bg-[#F5F5F5] text-[#111111] font-admin antialiased flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#111111] transition-colors min-h-[40px] px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft size={15} />
          <span>Return to Storefront</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] bg-white border border-[#E5E5E5] px-2.5 py-1 rounded-md">
          <ShieldCheck size={13} className="text-[#111111]" />
          <span>Secure Admin Portal</span>
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] mx-auto my-auto py-4">
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-8">
          {/* Brand Logo & Heading */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img
                src={settings?.logoUrl || '/logo.webp'}
                alt={settings?.brandName || 'SmoothSelf'}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
              <div className="hidden items-center justify-center text-[#111111]">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
              {settings?.brandName || 'SMOOTHSELF'} • COMMERCE HQ
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111]">
              Store Admin Access
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
              Sign in to manage orders, inventory, products, and store settings.
            </p>
          </div>

          {/* Validation / Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-neutral-100 border border-neutral-300 flex items-start gap-2.5 text-xs text-neutral-900"
            >
              <AlertCircle size={16} className="text-[#111111] flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[13px] font-medium text-[#111111] mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="admin@smoothself.in"
                  className="w-full min-h-[46px] pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#111111] placeholder:text-[#6B7280]/70 transition-colors focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-[13px] font-medium text-[#111111]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryHelp(!showRecoveryHelp)}
                  className="text-xs font-medium text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter your password"
                  className="w-full min-h-[46px] pl-10 pr-11 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#111111] placeholder:text-[#6B7280]/70 transition-colors focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F5] flex items-center justify-center transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {showRecoveryHelp && (
              <div className="p-3.5 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-xs text-[#6B7280] space-y-1 leading-relaxed">
                <p className="font-semibold text-[#111111] flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  <span>Administrator Credential Recovery</span>
                </p>
                <p>
                  For security, administrator passwords can be rotated from{' '}
                  <strong className="text-[#111111]">Store Settings → Administrator Account</strong>{' '}
                  or reset by your system administrator via the database console.
                </p>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] px-4 py-3 bg-[#111111] hover:bg-[#262626] active:bg-black text-white text-sm font-medium rounded-lg border border-[#111111] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Enter Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E5E5] text-center">
            <Link
              to="/"
              className="w-full min-h-[42px] px-4 py-2 bg-white hover:bg-[#F5F5F5] text-[#111111] border border-[#111111] rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to Live Storefront</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-[#6B7280] py-2">
        Protected by encrypted session authentication • {settings?.brandName || 'SmoothSelf'}
      </div>
    </div>
  );
};

export default AdminLogin;
