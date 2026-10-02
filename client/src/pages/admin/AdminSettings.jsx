import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, Settings as SettingsIcon, Truck, Mail, ShieldCheck } from 'lucide-react';

const AdminSettings = () => {
  const { token, settings, setSettings, showToast } = useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

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

  return (
    <div className="space-y-6 max-w-4xl">
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
          <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
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
              <label className="flex items-center space-x-2 text-xs font-semibold text-brand-primary cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={formData.announcementActive !== false}
                  onChange={e => setFormData({ ...formData, announcementActive: e.target.checked })}
                  className="rounded text-brand-primary"
                />
                <span>Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* 2. SHIPPING & LOGISTICS RULES */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3">
            2. Shipping & Logistics Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-brand-text mb-1">Free Shipping Threshold (₹) *</label>
              <input
                type="number"
                required
                value={formData.freeShippingThreshold || 450}
                onChange={e => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg font-bold text-brand-primary"
              />
              <p className="text-[10px] text-brand-muted mt-1">Orders above this qualify for free shipping automatically.</p>
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Standard Delivery Fee (₹) *</label>
              <input
                type="number"
                required
                value={formData.standardShippingFee || 50}
                onChange={e => setFormData({ ...formData, standardShippingFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg font-bold"
              />
              <p className="text-[10px] text-brand-muted mt-1">Applied when cart subtotal is under threshold.</p>
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">Express Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.expressShippingFee || 100}
                onChange={e => setFormData({ ...formData, expressShippingFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg font-bold"
              />
              <p className="text-[10px] text-brand-muted mt-1">Priority express courier dispatch.</p>
            </div>
          </div>
        </div>

        {/* 3. CONTACT & STORE LOCATIONS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-border pb-3">
            3. Customer Care & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
              <label className="block font-bold text-brand-text mb-1">Support Phone / Helpline</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-brand-text mb-1">Physical Store & Studio Address</label>
            <input
              type="text"
              value={formData.contactAddress || ''}
              onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg"
            />
          </div>
        </div>

        {/* 4. STORE POLICIES & LEGAL */}
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
            {isSaving ? 'Updating Storefront...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
