'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Save,
  Truck,
  Mail,
  ShieldCheck,
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  Store,
  FileText,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminTextarea,
  AdminCheckbox,
} from './components/AdminUI';

const AdminSettings = () => {
  const { token, user, updateUser, settings, setSettings, showToast } =
    useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // Admin Credentials State
  const [adminCreds, setAdminCreds] = useState({
    name: user?.name || 'Store Administrator',
    email: user?.email || 'admin@aurabotanica.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
      setAdminCreds((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        showToast(
          'Store settings updated successfully across the entire website!'
        );
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
      return showToast(
        'New password must be at least 6 characters long',
        'error'
      );
    }
    if (
      adminCreds.newPassword &&
      adminCreds.newPassword !== adminCreds.confirmPassword
    ) {
      return showToast(
        'New password and confirmation do not match',
        'error'
      );
    }

    setIsUpdatingCreds(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: adminCreds.name,
          email: adminCreds.email,
          password: adminCreds.newPassword || undefined,
          currentPassword: adminCreds.currentPassword || undefined,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (updateUser) {
          updateUser(resData.user, resData.token);
        }
        setAdminCreds((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        showToast(
          `Admin credentials updated successfully! Log in with: ${resData.user.email}`
        );
      } else {
        showToast(
          resData.message || 'Failed to update admin credentials',
          'error'
        );
      }
    } catch (err) {
      showToast(
        'Network error updating admin credentials: ' + err.message,
        'error'
      );
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* TOP PAGE HEADER */}
      <AdminPageHeader
        title="Storefront & Brand Settings"
        subtitle="Manage administrator credentials, brand identity, announcement banner, shipping thresholds, contact details, and legal policies."
        badge="Configuration"
        actions={
          <AdminButton
            variant="primary"
            icon={Save}
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving Changes..."
            className="w-full sm:w-auto"
          >
            Save Store Settings
          </AdminButton>
        }
      />

      {/* 1. ADMIN CREDENTIALS & SECURITY CARD */}
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-[#111111] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#111111]">
                Administrator Account & Login Credentials
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Change the primary administrator email address and login
                password.
              </p>
            </div>
          </div>
          <AdminBadge variant="success" dot>
            Security Active
          </AdminBadge>
        </div>

        <form onSubmit={handleUpdateAdminCredentials} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Admin Full Name"
              required
              icon={User}
              value={adminCreds.name}
              onChange={(e) =>
                setAdminCreds({ ...adminCreds, name: e.target.value })
              }
            />

            <AdminInput
              label="Admin Login Email ID"
              type="email"
              required
              icon={Mail}
              value={adminCreds.email}
              onChange={(e) =>
                setAdminCreds({ ...adminCreds, email: e.target.value })
              }
            />
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] space-y-4">
            <p className="font-semibold text-[#111111] flex items-center gap-2 text-xs">
              <Lock size={14} className="text-[#111111]" />
              <span>
                Change Password (Leave blank to keep current password)
              </span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <AdminInput
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Verify current password"
                value={adminCreds.currentPassword}
                onChange={(e) =>
                  setAdminCreds({
                    ...adminCreds,
                    currentPassword: e.target.value,
                  })
                }
              />

              <AdminInput
                label="New Password (min 6 chars)"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={adminCreds.newPassword}
                onChange={(e) =>
                  setAdminCreds({ ...adminCreds, newPassword: e.target.value })
                }
              />

              <AdminInput
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type new password"
                value={adminCreds.confirmPassword}
                onChange={(e) =>
                  setAdminCreds({
                    ...adminCreds,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] text-xs font-medium text-[#111111] hover:border-[#111111] inline-flex items-center justify-center gap-1.5 transition-colors self-start cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </span>
              </button>

              <AdminButton
                type="submit"
                variant="primary"
                icon={Key}
                isLoading={isUpdatingCreds}
                loadingText="Updating..."
                className="w-full sm:w-auto"
              >
                Update Admin Credentials
              </AdminButton>
            </div>
          </div>
        </form>
      </div>

      {/* 2. STOREFRONT SETTINGS FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. BRAND IDENTITY */}
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-[#E5E5E5] space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
              <Store size={16} />
            </div>
            <h3 className="text-base font-semibold text-[#111111]">
              1. Brand Identity & Header
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Brand Name"
              required
              value={formData.brandName || ''}
              onChange={(e) =>
                setFormData({ ...formData, brandName: e.target.value })
              }
              className="uppercase tracking-wider font-semibold"
            />

            <AdminInput
              label="Brand Tagline"
              value={formData.tagline || ''}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
            />
          </div>

          <div className="pt-1 space-y-3">
            <AdminInput
              label="Top Announcement Bar Text"
              value={formData.announcementText || ''}
              onChange={(e) =>
                setFormData({ ...formData, announcementText: e.target.value })
              }
            />
            <AdminCheckbox
              label="Display Top Announcement Banner on Storefront"
              checked={formData.announcementActive !== false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  announcementActive: e.target.checked,
                })
              }
            />
          </div>
        </div>

        {/* 2. SHIPPING & LOGISTICS */}
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-[#E5E5E5] space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
              <Truck size={16} />
            </div>
            <h3 className="text-base font-semibold text-[#111111]">
              2. Shipping Thresholds & Rates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminInput
              label="Free Shipping Threshold (₹)"
              type="number"
              value={formData.freeShippingThreshold || 450}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  freeShippingThreshold: Number(e.target.value),
                })
              }
            />

            <AdminInput
              label="Standard Shipping Fee (₹)"
              type="number"
              value={formData.standardShippingFee || 50}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  standardShippingFee: Number(e.target.value),
                })
              }
            />

            <AdminInput
              label="Express Shipping Fee (₹)"
              type="number"
              value={formData.expressShippingFee || 100}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expressShippingFee: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* 3. CONTACT & STORE POLICIES */}
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-[#E5E5E5] space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
              <Mail size={16} />
            </div>
            <h3 className="text-base font-semibold text-[#111111]">
              3. Support Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminInput
              label="Support Email"
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
            />

            <AdminInput
              label="Support Phone / WhatsApp"
              value={formData.contactPhone || ''}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
            />

            <AdminInput
              label="Headquarters Location"
              value={formData.contactAddress || ''}
              onChange={(e) =>
                setFormData({ ...formData, contactAddress: e.target.value })
              }
            />
          </div>
        </div>

        {/* 4. POLICIES */}
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-[#E5E5E5] space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
              <FileText size={16} />
            </div>
            <h3 className="text-base font-semibold text-[#111111]">
              4. Customer Policies
            </h3>
          </div>

          <div className="space-y-4">
            <AdminTextarea
              label="Privacy Policy"
              rows={3}
              value={formData.privacyPolicy || ''}
              onChange={(e) =>
                setFormData({ ...formData, privacyPolicy: e.target.value })
              }
            />

            <AdminTextarea
              label="Refund & Replacement Policy"
              rows={3}
              value={formData.refundPolicy || ''}
              onChange={(e) =>
                setFormData({ ...formData, refundPolicy: e.target.value })
              }
            />

            <AdminTextarea
              label="Shipping Policy"
              rows={3}
              value={formData.shippingPolicy || ''}
              onChange={(e) =>
                setFormData({ ...formData, shippingPolicy: e.target.value })
              }
            />

            <AdminTextarea
              label="Terms of Service"
              rows={3}
              value={formData.termsOfService || ''}
              onChange={(e) =>
                setFormData({ ...formData, termsOfService: e.target.value })
              }
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <AdminButton
            type="submit"
            variant="primary"
            size="lg"
            icon={Save}
            isLoading={isSaving}
            loadingText="Updating Storefront..."
            className="w-full sm:w-auto"
          >
            Save All Store Settings
          </AdminButton>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
