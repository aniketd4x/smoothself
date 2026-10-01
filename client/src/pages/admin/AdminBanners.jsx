import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react';

const AdminBanners = () => {
  const { token, showToast } = useApp();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    buttonText: 'Shop Bestsellers',
    buttonLink: '/shop',
    imageUrl: '',
    order: 1,
    isActive: true
  });

  const fetchBanners = () => {
    setIsLoading(true);
    fetch('/api/banners/all', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
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
      subtitle: 'Nourishing plant lipid barrier formulas with pure Madagascar vanilla extract.',
      tagline: 'CLEAN BEAUTY • 100% VEGAN',
      buttonText: 'Shop Collection',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1800&auto=format&fit=crop',
      order: banners.length + 1,
      isActive: true
    });
    setActiveModal('create');
  };

  const openEditModal = (banner) => {
    setFormData(banner);
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const resData = await res.json();
      if (resData.success && resData.url) {
        setFormData(prev => ({ ...prev, imageUrl: resData.url }));
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/banners/${activeModal._id}` : '/api/banners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Banner updated!' : 'Banner created!');
        setActiveModal(null);
        fetchBanners();
      }
    } catch {
      showToast('Error saving banner', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner slide?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Banner removed');
        setBanners(prev => prev.filter(b => b._id !== id));
      }
    } catch {
      showToast('Error deleting banner', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Homepage Hero Banners & Sliders
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Control the visual slides, headlines, promotional badges, and CTA destinations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition"
        >
          <Plus size={16} />
          <span>Add New Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b._id} className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="aspect-[16/9] bg-brand-surface overflow-hidden relative">
                <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  {b.isActive ? 'Live' : 'Hidden'}
                </span>
              </div>
              <div className="p-5 space-y-2">
                {b.tagline && <span className="text-[10px] uppercase font-bold text-brand-muted">{b.tagline}</span>}
                <h3 className="font-serif text-lg font-bold text-brand-primary leading-tight">{b.title}</h3>
                <p className="text-xs text-brand-muted line-clamp-2">{b.subtitle}</p>
                <div className="text-xs font-semibold text-brand-primary pt-1">
                  Button: "{b.buttonText}" → <code className="font-mono text-xs">{b.buttonLink}</code>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-brand-border/60 flex items-center justify-between text-xs">
              <span className="text-brand-muted">Order: {b.order}</span>
              <div className="space-x-2">
                <button onClick={() => openEditModal(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary">
                  {activeModal === 'create' ? 'Create Hero Slide' : 'Edit Slide'}
                </h3>
                <button onClick={() => setActiveModal(null)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-brand-text mb-1">Slide Headline *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Subtitle</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Tagline Pill</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. 100% VEGAN"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="bg-brand-surface/50 border border-brand-border rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-brand-text text-xs">Background Image *</label>
                    <label className={`cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition shadow-sm ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                      {isUploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
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
                    <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-brand-border bg-gray-100 shadow-sm">
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
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Button Link</label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={e => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border flex justify-end space-x-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg shadow">Save Slide</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
