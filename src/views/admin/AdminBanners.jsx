'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Smartphone,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminTextarea,
  AdminCheckbox,
  AdminModal,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingState,
} from './components/AdminUI';

const AdminBanners = () => {
  const { token, showToast } = useApp();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    buttonText: 'Shop Bestsellers',
    buttonLink: '/shop',
    imageUrl: '',
    mobileImageUrl: '',
    order: 1,
    isActive: true,
  });

  const fetchBanners = () => {
    setIsLoading(true);
    fetch('/api/banners/all', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBanners(data.banners);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const openCreateModal = () => {
    setFormData({
      title: 'Restorative Botanical Hydration',
      subtitle:
        'Nourishing plant lipid barrier formulas with pure Madagascar vanilla extract.',
      tagline: 'CLEAN BEAUTY • 100% VEGAN',
      buttonText: 'Shop Collection',
      buttonLink: '/shop',
      imageUrl:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1800&auto=format&fit=crop',
      mobileImageUrl: '',
      order: banners.length + 1,
      isActive: true,
    });
    setActiveModal('create');
  };

  const openEditModal = (banner) => {
    setFormData({
      ...banner,
      mobileImageUrl: banner.mobileImageUrl || '',
    });
    setActiveModal(banner);
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const resData = await res.json();
      if (resData.success && resData.url) {
        setFormData((prev) => ({ ...prev, imageUrl: resData.url }));
        showToast('Banner image uploaded successfully!');
      } else {
        showToast(resData.message || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleMobileBannerImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMobile(true);
    try {
      const data = new FormData();
      data.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const resData = await res.json();
      if (resData.success && resData.url) {
        setFormData((prev) => ({ ...prev, mobileImageUrl: resData.url }));
        showToast('Mobile hero image uploaded successfully!');
      } else {
        showToast(resData.message || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Mobile image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingMobile(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit
        ? `/api/banners/${activeModal._id}`
        : '/api/banners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Banner updated!' : 'Banner created!');
        setActiveModal(null);
        fetchBanners();
      } else {
        showToast(data.message || 'Error saving banner', 'error');
      }
    } catch {
      showToast('Error saving banner', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/banners/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Banner removed');
        setBanners((prev) => prev.filter((b) => b._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        showToast(data.message || 'Error deleting banner', 'error');
      }
    } catch {
      showToast('Error deleting banner', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage Hero Banners & Sliders"
        subtitle="Control the visual slides, headlines, promotional badges, and CTA destinations."
        badge={`${banners.length} Slides`}
        actions={
          <AdminButton
            variant="primary"
            icon={Plus}
            onClick={openCreateModal}
            className="w-full sm:w-auto"
          >
            Add New Slide
          </AdminButton>
        }
      />

      {isLoading && banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading homepage banners..." />
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden flex flex-col justify-between transition-colors hover:border-[#D4D4D4]"
            >
              <div>
                <div className="aspect-[16/9] bg-[#F5F5F5] overflow-hidden relative border-b border-[#E5E5E5]">
                  <img
                    src={b.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <AdminBadge variant={b.isActive ? 'dark' : 'muted'}>
                      {b.isActive ? 'Live' : 'Hidden'}
                    </AdminBadge>
                  </div>
                  {b.mobileImageUrl && (
                    <div className="absolute top-3 left-3">
                      <AdminBadge variant="neutral">
                        <Smartphone size={12} />
                        <span>Mobile Ready</span>
                      </AdminBadge>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  {b.tagline && (
                    <span className="inline-block text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-0.5 rounded">
                      {b.tagline}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-[#111111] leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-[13px] text-[#6B7280] line-clamp-2 leading-relaxed">
                    {b.subtitle}
                  </p>
                  <div className="text-xs font-medium text-[#111111] pt-1">
                    CTA: &ldquo;{b.buttonText}&rdquo; →{' '}
                    <code className="font-mono text-xs bg-[#F5F5F5] border border-[#E5E5E5] px-1.5 py-0.5 rounded">
                      {b.buttonLink}
                    </code>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-[#F5F5F5]/60 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                <span className="font-medium text-[#6B7280]">
                  Slide Order:{' '}
                  <strong className="text-[#111111]">{b.order}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="outline"
                    size="xs"
                    icon={Edit2}
                    onClick={() => openEditModal(b)}
                  >
                    Edit Slide
                  </AdminButton>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(b)}
                    className="w-8 h-8 rounded-md border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                    aria-label={`Delete slide ${b.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminEmptyState
            icon={ImageIcon}
            title="No hero slides configured"
            description="Create a hero banner slide to showcase collections on the storefront homepage."
            actionLabel="Add New Slide"
            onAction={openCreateModal}
          />
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AdminModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        subtitle="Storefront Merchandising"
        title={activeModal === 'create' ? 'Create Hero Slide' : 'Edit Slide'}
        maxWidth="max-w-lg"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setActiveModal(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              type="submit"
              form="admin-banner-form"
              isLoading={isSaving}
              loadingText="Saving..."
              className="w-full sm:w-auto"
            >
              Save Slide
            </AdminButton>
          </>
        }
      >
        <form
          id="admin-banner-form"
          onSubmit={handleSave}
          className="space-y-4"
        >
          <AdminInput
            label="Slide Headline"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <AdminTextarea
            label="Subtitle"
            rows={2}
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AdminInput
              label="Tagline Pill"
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              placeholder="e.g. 100% VEGAN"
            />
            <AdminInput
              label="Sort Order"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
            />
          </div>

          {/* Desktop Background Image */}
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[13px] font-semibold text-[#111111]">
                Background Image (Desktop) <span className="text-red-600">*</span>
              </label>
              <label
                className={`cursor-pointer min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-lg hover:bg-[#262626] transition-colors ${
                  isUploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {isUploading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UploadCloud size={13} />
                )}
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {formData.imageUrl && (
              <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-[#E5E5E5] bg-white">
                <img
                  src={formData.imageUrl}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <input
              type="text"
              required
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="Or enter image URL"
              className="w-full min-h-[40px] px-3.5 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Mobile Specific Hero Image */}
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <label className="block text-[13px] font-semibold text-[#111111]">
                  Mobile Hero Image (9:16 Portrait)
                </label>
                <span className="text-xs text-[#6B7280]">
                  Vertical banner optimized for smartphones
                </span>
              </div>
              <label
                className={`cursor-pointer min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-lg hover:bg-[#262626] transition-colors flex-shrink-0 ${
                  isUploadingMobile ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {isUploadingMobile ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UploadCloud size={13} />
                )}
                <span>
                  {isUploadingMobile ? 'Uploading...' : 'Upload Mobile'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMobileBannerImageUpload}
                  disabled={isUploadingMobile}
                />
              </label>
            </div>

            {formData.mobileImageUrl && (
              <div className="relative w-28 aspect-[9/16] rounded-lg overflow-hidden border border-[#E5E5E5] bg-white mx-auto">
                <img
                  src={formData.mobileImageUrl}
                  alt="Mobile Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <input
              type="text"
              value={formData.mobileImageUrl || ''}
              onChange={(e) =>
                setFormData({ ...formData, mobileImageUrl: e.target.value })
              }
              placeholder="Or enter mobile image URL (optional, falls back to desktop)"
              className="w-full min-h-[40px] px-3.5 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AdminInput
              label="Button Text"
              value={formData.buttonText}
              onChange={(e) =>
                setFormData({ ...formData, buttonText: e.target.value })
              }
            />
            <AdminInput
              label="Button Link"
              value={formData.buttonLink}
              onChange={(e) =>
                setFormData({ ...formData, buttonLink: e.target.value })
              }
              className="font-mono"
            />
          </div>

          <div className="pt-1">
            <AdminCheckbox
              label="Slide Visible (Live on Homepage)"
              checked={formData.isActive !== false}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
          </div>
        </form>
      </AdminModal>

      {/* DELETE CONFIRMATION */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Hero Banner Slide"
        description="Are you sure you want to delete this homepage banner slide?"
        itemTitle={deleteTarget?.title}
        itemSubtitle={deleteTarget?.tagline}
        confirmLabel="Delete Slide"
      />
    </div>
  );
};

export default AdminBanners;
