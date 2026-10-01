import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Search, Check, X, Package, AlertTriangle, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

const AdminProducts = () => {
  const { token, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State (null = closed, 'create' = new, or product object = editing)
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 249,
    compareAtPrice: 299,
    costPrice: 90,
    sku: '',
    stock: 100,
    lowStockThreshold: 10,
    weight: '200ml',
    images: [],
    shortDescription: '',
    description: '',
    ingredients: '',
    howToUse: '',
    badges: 'BESTSELLER',
    isFeatured: true,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const fetchProductsAndCategories = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/products/admin/all', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/categories/all', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([prodData, catData]) => {
      if (prodData.success) setProducts(prodData.products);
      if (catData.success) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: catData.categories[0]._id }));
        }
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [token]);

  const openCreateModal = () => {
    setFormData({
      name: '',
      category: categories[0]?._id || '',
      price: 249,
      compareAtPrice: 299,
      costPrice: 90,
      sku: `SS-PRD-${Date.now().toString().slice(-4)}`,
      stock: 100,
      lowStockThreshold: 10,
      weight: '200ml',
      images: [],
      shortDescription: '',
      description: '',
      ingredients: '',
      howToUse: '',
      badges: 'BESTSELLER',
      isFeatured: true,
      isActive: true
    });
    setCustomImageUrl('');
    setActiveModal('create');
  };

  const openEditModal = (product) => {
    setFormData({
      ...product,
      category: product.category?._id || product.category,
      images: Array.isArray(product.images) ? [...product.images] : (product.images ? [product.images] : []),
      badges: Array.isArray(product.badges) ? product.badges.join(', ') : product.badges
    });
    setCustomImageUrl('');
    setActiveModal(product);
  };

  const handleImageFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append('images', files[i]);
      }

      const res = await fetch('/api/upload/multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const resData = await res.json();
      if (resData.success && resData.urls) {
        setFormData(prev => ({
          ...prev,
          images: [...(Array.isArray(prev.images) ? prev.images : []), ...resData.urls]
        }));
        showToast(`${resData.urls.length} photo(s) uploaded successfully!`);
      } else {
        showToast(resData.message || 'Failed to upload images', 'error');
      }
    } catch (err) {
      showToast('Image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: (Array.isArray(prev.images) ? prev.images : []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...(Array.isArray(prev.images) ? prev.images : []), customImageUrl.trim()]
    }));
    setCustomImageUrl('');
    showToast('Image URL added');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      compareAtPrice: Number(formData.compareAtPrice),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold),
      images: Array.isArray(formData.images)
        ? formData.images.filter(Boolean)
        : (typeof formData.images === 'string' ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : []),
      badges: typeof formData.badges === 'string'
        ? formData.badges.split(',').map(s => s.trim()).filter(Boolean)
        : formData.badges
    };

    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/products/${activeModal._id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(isEdit ? 'Product updated successfully!' : 'New product created!');
        setActiveModal(null);
        fetchProductsAndCategories();
      } else {
        showToast(resData.message || 'Error saving product', 'error');
      }
    } catch {
      showToast('Network error saving product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('Product deleted successfully');
        setProducts(prev => prev.filter(p => p._id !== productId));
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  const handleQuickStockUpdate = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch(`/api/products/${productId}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      const resData = await res.json();
      if (resData.success) {
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
      }
    } catch {
      showToast('Failed to update stock', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Products Catalog & Inventory
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage formulations, pricing, badges, images, and live warehouse inventory.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-brand-border shadow-sm">
        <Search size={18} className="text-brand-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by product name, SKU, or keyword..."
          className="flex-1 bg-transparent text-xs focus:outline-none"
        />
        <span className="text-xs text-brand-muted">{filteredProducts.length} items</span>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / Compare</th>
                <th className="p-4">Inventory Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredProducts.map(p => (
                <tr key={p._id} className="hover:bg-brand-surface/40 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'}
                        alt=""
                        className="w-12 h-14 object-cover rounded-md bg-brand-surface border border-brand-border flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-brand-text line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-brand-muted font-mono">{p.sku} • {p.weight}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-brand-text">
                    {p.categoryName || p.category?.name || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-brand-primary">₹{p.price}</span>
                    {p.compareAtPrice > p.price && (
                      <span className="text-gray-400 line-through ml-1.5 text-[11px]">₹{p.compareAtPrice}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.stock <= p.lowStockThreshold
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.stock} in stock
                      </span>
                      <button
                        onClick={() => handleQuickStockUpdate(p._id, p.stock, 10)}
                        className="text-[10px] text-brand-primary bg-brand-surface hover:bg-brand-border px-1.5 py-0.5 rounded font-bold"
                        title="Add +10 units"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p._id, p.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete Product"
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

      {/* CREATE / EDIT MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 z-10 space-y-6">
              <div className="flex justify-between items-center border-b border-brand-border pb-4">
                <h3 className="font-serif text-xl font-bold text-brand-primary">
                  {activeModal === 'create' ? 'Create New Product' : `Edit Product: ${activeModal.name}`}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-brand-muted hover:text-brand-primary">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Product Name & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-brand-text mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Velvet Vanilla & Vitamin E Body Lotion — 200ml"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. AB-LOT-VAN-200"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Category & Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs font-medium"
                    >
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs font-bold text-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Compare At Price (₹)</label>
                    <input
                      type="number"
                      value={formData.compareAtPrice}
                      onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Stock Units *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Product Photos Section */}
                <div className="bg-brand-surface/50 border border-brand-border rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-bold text-brand-primary text-xs flex items-center gap-1.5">
                        <ImageIcon size={16} />
                        <span>Product Photos ({Array.isArray(formData.images) ? formData.images.length : 0})</span>
                      </label>
                      <p className="text-[11px] text-brand-muted">
                        Upload high-res product photos from your device or paste an image URL. First photo is the primary cover image.
                      </p>
                    </div>

                    {/* Upload File Input Button */}
                    <label className={`cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition shadow-sm ${isUploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                      {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Photos'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>

                  {/* Image Thumbnails Grid */}
                  {Array.isArray(formData.images) && formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-brand-border bg-white shadow-sm">
                          <img
                            src={img}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Invalid+Image'; }}
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 transition shadow"
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-brand-border rounded-lg p-6 text-center text-brand-muted bg-white/50">
                      <UploadCloud size={28} className="mx-auto mb-1 text-brand-muted/70" />
                      <p className="text-xs font-medium">No photos uploaded yet</p>
                      <p className="text-[10px]">Click "Upload Photos" above or paste an image URL below</p>
                    </div>
                  )}

                  {/* Add Image by URL fallback */}
                  <div className="flex gap-2 pt-2 border-t border-brand-border/60">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={e => setCustomImageUrl(e.target.value)}
                      placeholder="Or paste external image URL (e.g. https://.../photo.jpg)"
                      className="flex-1 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomUrl(); } }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomUrl}
                      className="px-3 py-1.5 bg-brand-surface hover:bg-brand-border text-brand-text font-semibold text-xs rounded-lg border border-brand-border transition"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <label className="block font-bold text-brand-text mb-1">Badges (comma-separated, e.g. BESTSELLER, HOT, NEW, -17%)</label>
                  <input
                    type="text"
                    value={formData.badges}
                    onChange={e => setFormData({ ...formData, badges: e.target.value })}
                    placeholder="BESTSELLER, HOT"
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                {/* Descriptions */}
                <div>
                  <label className="block font-bold text-brand-text mb-1">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Full Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Botanical Ingredients</label>
                    <textarea
                      rows={2}
                      value={formData.ingredients}
                      onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">How To Use</label>
                    <textarea
                      rows={2}
                      value={formData.howToUse}
                      onChange={e => setFormData({ ...formData, howToUse: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-brand-primary"
                    />
                    <span className="font-semibold text-brand-text">Featured on Homepage</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-brand-primary"
                    />
                    <span className="font-semibold text-brand-text">Published (Active)</span>
                  </label>
                </div>

                {/* Modal CTA */}
                <div className="pt-4 border-t border-brand-border flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2.5 border border-brand-border rounded-lg font-semibold text-brand-text hover:bg-brand-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-lg shadow disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Product...' : 'Save Formulation'}
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

export default AdminProducts;
