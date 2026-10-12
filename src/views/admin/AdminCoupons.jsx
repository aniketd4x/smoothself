'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Tag, Trash2, Search } from 'lucide-react';
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminModal,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingState,
} from './components/AdminUI';

const AdminCoupons = () => {
  const { token, showToast } = useApp();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 499,
    maxDiscountAmount: 200,
    expiryDate: '2028-12-31',
    usageLimit: 1000,
    isActive: true,
  });

  const fetchCoupons = () => {
    setIsLoading(true);
    fetch('/api/coupons', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
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
    setIsSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Coupon removed');
        setCoupons((prev) => prev.filter((c) => (c._id || c.id) !== id));
        setDeleteTarget(null);
      } else {
        showToast(data.message || 'Error deleting coupon', 'error');
      }
    } catch {
      showToast('Error deleting coupon', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons & Promotional Discounts"
        subtitle="Create coupon codes with percentage or flat cash discounts and usage caps."
        badge={`${coupons.length} Codes`}
        actions={
          <AdminButton
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto"
          >
            Create New Coupon
          </AdminButton>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupon codes or descriptions..."
            className="w-full min-h-[40px] pl-10 pr-4 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-[13px] text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111] transition-colors"
          />
        </div>
        <span className="text-xs font-medium text-[#6B7280] hidden sm:inline">
          {filteredCoupons.length} coupons
        </span>
      </div>

      {isLoading && coupons.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading promotional coupons..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Coupon Code</th>
                  <th className="py-3.5 px-5">Discount</th>
                  <th className="py-3.5 px-5">Min Order</th>
                  <th className="py-3.5 px-5">Used Count</th>
                  <th className="py-3.5 px-5">Expiry Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((c) => (
                    <tr
                      key={c._id || c.id}
                      className="hover:bg-[#F5F5F5]/60 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <span className="inline-block font-mono font-bold text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-2.5 py-0.5 rounded text-xs">
                          {c.code}
                        </span>
                        {c.description && (
                          <span className="block text-xs text-[#6B7280] mt-1">
                            {c.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#111111]">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="py-3.5 px-5 text-[#111111]">
                        ₹{c.minOrderAmount}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-[#6B7280]">
                        {c.usageCount || 0} times
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#6B7280]">
                        {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <AdminBadge
                          variant={c.isActive ? 'success' : 'muted'}
                          dot
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </AdminBadge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="w-9 h-9 rounded-lg border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                          aria-label={`Delete coupon ${c.code}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <AdminEmptyState
                        icon={Tag}
                        title="No coupons found"
                        description="Create a promotional coupon code to offer discounts at checkout."
                        actionLabel="Create New Coupon"
                        onAction={() => setShowModal(true)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-[#E5E5E5]">
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((c) => (
                <div key={c._id || c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block font-mono font-bold text-xs text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-2.5 py-1 rounded">
                        {c.code}
                      </span>
                      {c.description && (
                        <p className="text-xs text-[#6B7280] mt-1.5">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <AdminBadge
                      variant={c.isActive ? 'success' : 'muted'}
                      dot
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </AdminBadge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                        Discount
                      </span>
                      <span className="font-bold text-[#111111]">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} OFF`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                        Min Spend
                      </span>
                      <span className="font-semibold text-[#111111]">
                        ₹{c.minOrderAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                        Used
                      </span>
                      <span className="font-mono text-[#111111]">
                        {c.usageCount || 0}x
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#6B7280]">
                      Expires{' '}
                      {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <AdminButton
                      variant="danger-outline"
                      size="xs"
                      icon={Trash2}
                      onClick={() => setDeleteTarget(c)}
                    >
                      Delete
                    </AdminButton>
                  </div>
                </div>
              ))
            ) : (
              <AdminEmptyState
                icon={Tag}
                title="No coupons found"
                description="Create a promotional coupon code to offer discounts at checkout."
                actionLabel="Create New Coupon"
                onAction={() => setShowModal(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        subtitle="Promotions"
        title="Create Promo Coupon"
        maxWidth="max-w-md"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              type="submit"
              form="admin-coupon-form"
              isLoading={isSaving}
              loadingText="Creating..."
              className="w-full sm:w-auto"
            >
              Create Coupon
            </AdminButton>
          </>
        }
      >
        <form
          id="admin-coupon-form"
          onSubmit={handleCreateCoupon}
          className="space-y-4"
        >
          <AdminInput
            label="Coupon Code (Uppercase)"
            required
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="e.g. FESTIVE20"
            className="uppercase font-mono font-bold"
          />

          <AdminInput
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g. 20% off on all autumn body butters"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AdminSelect
              label="Discount Type"
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value })
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Flat Cash (₹)</option>
            </AdminSelect>

            <AdminInput
              label="Discount Value"
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountValue: Number(e.target.value),
                })
              }
              className="font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AdminInput
              label="Min Spend (₹)"
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderAmount: Number(e.target.value),
                })
              }
            />

            <AdminInput
              label="Max Cap (₹, 0=none)"
              type="number"
              value={formData.maxDiscountAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxDiscountAmount: Number(e.target.value),
                })
              }
            />
          </div>

          <AdminInput
            label="Expiry Date"
            type="date"
            required
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
          />
        </form>
      </AdminModal>

      {/* DELETE COUPON CONFIRMATION */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Promo Coupon"
        description="Are you sure you want to permanently remove this coupon code? Customers will no longer be able to apply it at checkout."
        itemTitle={deleteTarget?.code}
        itemSubtitle={deleteTarget?.description}
        confirmLabel="Delete Coupon"
      />
    </div>
  );
};

export default AdminCoupons;
