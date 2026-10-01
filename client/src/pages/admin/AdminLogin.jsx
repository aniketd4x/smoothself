import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const { loginUser, showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@aurabotanica.com');
  const [password, setPassword] = useState('admin123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginUser(data.user, data.token);
        showToast('Admin authenticated successfully!');
        navigate('/admin');
      } else {
        showToast(data.message || 'Unauthorized: Admin privileges required', 'error');
      }
    } catch {
      showToast('Network error authenticating admin', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-3 text-brand-primary shadow-inner">
            <ShieldCheck size={30} />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-brand-muted uppercase">Commerce Operations</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary mt-1">
            Store Admin Access
          </h1>
          <p className="text-xs text-brand-muted mt-1.5">
            Log in to manage orders, inventory, products, and customer communications.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@aurabotanica.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary font-medium"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-brand-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary font-medium"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-brand-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
            <ArrowRight size={15} />
          </button>

          {/* Quick Credential Helper */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 text-[11px] text-purple-900 space-y-1">
            <p className="font-bold">Default Superadmin Credentials:</p>
            <p>Email: <code className="font-mono">admin@aurabotanica.com</code></p>
            <p>Password: <code className="font-mono">admin123456</code></p>
          </div>

          <div className="text-center pt-3">
            <Link to="/" className="text-xs text-brand-muted hover:text-brand-primary transition">
              ← Return to Storefront
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
