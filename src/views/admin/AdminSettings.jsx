'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, Settings as SettingsIcon, Truck, Mail, ShieldCheck, Lock, User, Key, Eye, EyeOff } from 'lucide-react';

const AdminSettings = () => {
  const { token, user, updateUser, settings, setSettings, showToast } = useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // Admin Credentials State
  const [adminCreds, setAdminCreds] = useState({
    name: user?.name || 'Store Administrator',
    email: user?.email || 'admin@aurabotanica.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
      setAdminCreds(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        showToast('Store settings updated successfully across the entire website!');
      } else {
        showToast(data.message || 'Error updating settings', 'error');
      }
    } catch {
      showToast('Network error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAdminCredentials = async (e) => {
    e.preventDefault();

    if (adminCreds.newPassword && adminCreds.newPassword.length < 6) {
      return showToast('New password must be at least 6 characters long', 'error');
    }
    if (adminCreds.newPassword && adminCreds.newPassword !== adminCreds.confirmPassword) {
      return showToast('New password and confirmation do not match', 'error');
    }

    setIsUpdatingCreds(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: adminCreds.name,
          email: adminCreds.email,
          password: adminCreds.newPassword || undefined,
          currentPassword: adminCreds.currentPassword || undefined
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (updateUser) {
          updateUser(resData.user, resData.token);
        }
        setAdminCreds(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        showToast(`Admin credentials updated successfully! Log in with: ${resData.user.email}`);
      } else {
        showToast(resData.message || 'Failed to update admin credentials', 'error');
      }
    } catch (err) {
      showToast('Network error updating admin credentials: ' + err.message, 'error');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* 1. ADMIN CREDENTIALS & SECURITY CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-brand-primary/20 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-border gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-primary">
                Administrator Account & Login Credentials
              </h2>
              <p className="text-xs text-brand-muted">
                Change the primary administrator email address and login password.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 self-start sm:self-center">
            Security Active
          </span>
        </div>

        <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-brand-text mb-1">
                Admin Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminCreds.name}
                  onChange={e => setAdminCreds({ ...adminCreds, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg font-medium"
                />
                <User size={15} className="absolute left-3 top-3 text-brand-muted" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">
                Admin Login Email ID *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminCreds.email}
                  onChange={e => setAdminCreds({ ...adminCreds, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg font-medium"
                />
                <Mail size={15} className="absolute left-3 top-3 text-brand-muted" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border/60">
            <p className="font-bold text-brand-text mb-2 flex items-center space-x-1.5 text-xs">
              <Lock size={14} className="text-brand-primary" />
              <span>Change Password (Leave blank to keep current password)</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-brand-muted mb-1 text-[11px]">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Verify current password"
                    value={adminCreds.currentPassword}
                    onChange={e => setAdminCreds({ ...adminCreds, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-brand-muted mb-1 text-[11px]">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={adminCreds.newPassword}
                    onChange={e => setAdminCreds({ ...adminCreds, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-brand-muted mb-1 text-[11px]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={adminCreds.confirmPassword}
                    onChange={e => setAdminCreds({ ...adminCreds, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-brand-muted hover:text-brand-primary flex items-center space-x-1"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>

              <button
                type="submit"
                disabled={isUpdatingCreds}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
              >
                <Key size={14} />
                <span>{isUpdatingCreds ? 'Updating...' : 'Update Admin Credentials'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. STOREFRONT SETTINGS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Storefront & Brand Settings
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Customize our brand identity, announcement banner, free shipping threshold, contact details, and policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition self-start sm:self-auto disabled:opacity-50"
        >
          <Save size={15} />
          <span>{isSaving ? 'Saving Changes...' : 'Save Store Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. BRAND IDENTITY */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3">
            1. Brand Identity & Header
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-brand-text mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={formData.brandName || ''}
                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg uppercase tracking-wider font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block font-bold text-brand-text mb-1 text-xs">Top Announcement Bar Text</label>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={formData.announcementText || ''}
                onChange={e => setFormData({ ...formData, announcementText: e.target.value })}
                className="flex-1 px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs"
              />
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementActive !== false}
                  onChange={e => setFormData({ ...formData, announcementActive: e.target.checked })}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span>Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* 2. SHIPPING & LOGISTICS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3 flex items-center space-x-2">
            <Truck size={18} />
            <span>2. Shipping Thresholds & Rates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-brand-text mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={formData.freeShippingThreshold || 450}
                onChange={e => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={formData.standardShippingFee || 50}
                onChange={e => setFormData({ ...formData, standardShippingFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Express Shipping Fee (₹)</label>
              <input
                type="number"
                value={formData.expressShippingFee || 100}
                onChange={e => setFormData({ ...formData, expressShippingFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 3. CONTACT & STORE POLICIES */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3 flex items-center space-x-2">
            <Mail size={18} />
            <span>3. Support Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-brand-text mb-1">Support Email</label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Headquarters Location</label>
              <input
                type="text"
                value={formData.contactAddress || ''}
                onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 4. POLICIES */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3">
            4. Customer Policies
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-brand-text mb-1">Privacy Policy</label>
              <textarea
                rows={3}
                value={formData.privacyPolicy || ''}
                onChange={e => setFormData({ ...formData, privacyPolicy: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Refund & Replacement Policy</label>
              <textarea
                rows={3}
                value={formData.refundPolicy || ''}
                onChange={e => setFormData({ ...formData, refundPolicy: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Shipping Policy</label>
              <textarea
                rows={3}
                value={formData.shippingPolicy || ''}
                onChange={e => setFormData({ ...formData, shippingPolicy: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Terms of Service</label>
              <textarea
                rows={3}
                value={formData.termsOfService || ''}
                onChange={e => setFormData({ ...formData, termsOfService: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {isSaving ? 'Updating Storefront...' : 'Save All Store Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
