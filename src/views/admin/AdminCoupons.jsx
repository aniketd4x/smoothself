'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Tag, Trash2, Edit2, X, Check } from 'lucide-react';

const AdminCoupons = () => {
  const { token, showToast } = useApp();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 499,
    maxDiscountAmount: 200,
    expiryDate: '2028-12-31',
    usageLimit: 1000,
    isActive: true
  });

  const fetchCoupons = () => {
    setIsLoading(true);
    fetch('/api/coupons', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success) setCoupons(data.coupons);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Coupon created successfully!');
        setShowModal(false);
        fetchCoupons();
      } else {
        showToast(data.message || 'Error creating coupon', 'error');
      }
    } catch {
      showToast('Error creating coupon', 'error');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Coupon removed');
        setCoupons(prev => prev.filter(c => (c._id || c.id) !== id));
      }
    } catch {
      showToast('Error deleting coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Coupons & Promotional Discounts
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Create coupon codes with percentage or flat cash discounts and usage caps.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition"
        >
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Used Count</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {coupons.map((c) => (
                <tr key={c._id || c.id} className="hover:bg-brand-surface/40 transition">
                  <td className="p-4 font-mono font-bold text-brand-primary text-sm">
                    {c.code}
                    <span className="block text-[11px] font-sans font-normal text-brand-muted">{c.description}</span>
                  </td>
                  <td className="p-4 font-bold text-emerald-700">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </td>
                  <td className="p-4">₹{c.minOrderAmount}</td>
                  <td className="p-4 font-mono">{c.usageCount} times</td>
                  <td className="p-4 text-brand-muted">
                    {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id || c.id, c.code)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary">Create Promo Coupon</h3>
                <button onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-brand-text mb-1">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE20"
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 20% off on all autumn body butters"
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat Cash (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Min Spend (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Max Cap (₹, 0=none)</label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={e => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                  />
                </div>

                <div className="pt-3 border-t border-brand-border flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg shadow">
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
