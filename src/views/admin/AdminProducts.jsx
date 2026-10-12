'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Package,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminCheckbox,
  AdminModal,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingState,
  AdminPagination,
} from './components/AdminUI';

const AdminProducts = () => {
  const { token, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State (null = closed, 'create' = new, or product object = editing)
  const [activeModal, setActiveModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const fetchProductsAndCategories = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/products/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch('/api/categories/all', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([prodData, catData]) => {
        if (prodData.success) setProducts(prodData.products);
        if (catData.success) {
          setCategories(catData.categories);
          if (catData.categories.length > 0 && !formData.category) {
            setFormData((prev) => ({
              ...prev,
              category: catData.categories[0]._id || catData.categories[0].id,
            }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [token]);

  const openCreateModal = () => {
    setFormData({
      name: '',
      category: categories[0]?._id || categories[0]?.id || '',
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
      isActive: true,
    });
    setCustomImageUrl('');
    setActiveModal('create');
  };

  const openEditModal = (product) => {
    setFormData({
      ...product,
      category:
        product.category?._id ||
        product.category?.id ||
        product.category_id ||
        product.category,
      images: Array.isArray(product.images)
        ? [...product.images]
        : product.images
        ? [product.images]
        : [],
      badges: Array.isArray(product.badges)
        ? product.badges.join(', ')
        : product.badges,
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
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const resData = await res.json();
      if (resData.success && resData.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [
            ...(Array.isArray(prev.images) ? prev.images : []),
            ...resData.urls,
          ],
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
    setFormData((prev) => ({
      ...prev,
      images: (Array.isArray(prev.images) ? prev.images : []).filter(
        (_, idx) => idx !== indexToRemove
      ),
    }));
  };

  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...(Array.isArray(prev.images) ? prev.images : []),
        customImageUrl.trim(),
      ],
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
        : typeof formData.images === 'string'
        ? formData.images
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      badges:
        typeof formData.badges === 'string'
          ? formData.badges
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : formData.badges,
    };

    try {
      const editId =
        activeModal !== 'create'
          ? activeModal?._id || activeModal?.id
          : null;
      const isEdit = Boolean(editId);
      const url = isEdit ? `/api/products/${editId}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(
          isEdit ? 'Product updated successfully!' : 'New product created!'
        );
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

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    const productId =
      deleteTarget._id || deleteTarget.id || deleteTarget.slug;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      let resData = null;
      try {
        resData = await res.json();
      } catch {
        resData = {
          success: false,
          message: 'Server returned non-JSON response',
        };
      }

      if (res.ok && resData && resData.success) {
        showToast(`"${deleteTarget.name}" deleted successfully!`);
        setProducts((prev) =>
          prev.filter(
            (p) =>
              (p._id || p.id) !== (deleteTarget._id || deleteTarget.id) &&
              p.slug !== deleteTarget.slug
          )
        );
        setDeleteTarget(null);
        fetchProductsAndCategories();
      } else {
        showToast(
          resData?.message ||
            `Failed to delete product (Status ${res.status})`,
          'error'
        );
      }
    } catch (err) {
      showToast('Error deleting product: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStockUpdate = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch(`/api/products/${productId}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });
      const resData = await res.json();
      if (resData.success) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id || p.id) === productId ? { ...p, stock: newStock } : p
          )
        );
      }
    } catch {
      showToast('Failed to update stock', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const prodCatId =
      p.category?._id || p.category?.id || p.category_id || p.category;
    const matchesCategory =
      categoryFilter === 'all' || String(prodCatId) === String(categoryFilter);

    const isLowStock =
      (Number(p.stock) || 0) <= (Number(p.lowStockThreshold) || 10);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'draft' && !p.isActive) ||
      (statusFilter === 'low' && isLowStock);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <AdminPageHeader
        title="Products Catalog & Inventory"
        subtitle="Manage formulations, pricing, badges, images, and live warehouse inventory."
        badge={`${products.length} Total`}
        actions={
          <AdminButton
            variant="primary"
            icon={Plus}
            onClick={openCreateModal}
            className="w-full sm:w-auto"
          >
            Add New Product
          </AdminButton>
        }
      />

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, SKU, or keyword..."
            className="w-full min-h-[42px] pl-10 pr-4 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-[13px] text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111] transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="min-h-[42px] px-3.5 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs font-medium text-[#111111] focus:outline-none focus:border-[#111111]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-lg border border-[#E5E5E5] overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'low', label: 'Low Stock' },
              { id: 'draft', label: 'Draft' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`min-h-[32px] px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#111111] text-white'
                    : 'text-[#6B7280] hover:text-[#111111]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE & MOBILE CARDS */}
      {isLoading && products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading product catalog..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Price / Compare</th>
                  <th className="py-3.5 px-5">Inventory Stock</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p) => {
                    const isLow =
                      (Number(p.stock) || 0) <=
                      (Number(p.lowStockThreshold) || 10);
                    return (
                      <tr
                        key={p._id || p.id}
                        className="hover:bg-[#F5F5F5]/60 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={
                                p.images?.[0] ||
                                'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'
                              }
                              alt=""
                              className="w-11 h-13 object-cover rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-[#111111] line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                                {p.sku} • {p.weight}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <AdminBadge variant="neutral">
                            {p.categoryName || p.category?.name || 'Unassigned'}
                          </AdminBadge>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-[#111111]">
                            ₹{p.price}
                          </span>
                          {p.compareAtPrice > p.price && (
                            <span className="text-[#6B7280] line-through ml-1.5 text-xs">
                              ₹{p.compareAtPrice}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <AdminBadge
                              variant={isLow ? 'danger' : 'success'}
                              dot
                            >
                              {p.stock} in stock
                            </AdminBadge>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickStockUpdate(
                                  p._id || p.id,
                                  p.stock,
                                  10
                                )
                              }
                              className="min-h-[28px] px-2 py-0.5 rounded-md bg-white border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Add +10 units"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <AdminBadge
                            variant={p.isActive ? 'dark' : 'muted'}
                          >
                            {p.isActive ? 'Active' : 'Draft'}
                          </AdminBadge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="w-9 h-9 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#F5F5F5] text-[#111111] inline-flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit Product"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(p)}
                              className="w-9 h-9 rounded-lg border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete Product"
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <AdminEmptyState
                        icon={Package}
                        title="No matching products"
                        description="Try clearing your search filters or add a new formulation to the catalog."
                        actionLabel="Add New Product"
                        onAction={openCreateModal}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-[#E5E5E5]">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => {
                const isLow =
                  (Number(p.stock) || 0) <=
                  (Number(p.lowStockThreshold) || 10);
                return (
                  <div key={p._id || p.id} className="p-4 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          p.images?.[0] ||
                          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'
                        }
                        alt=""
                        className="w-14 h-16 object-cover rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[#111111] line-clamp-2">
                            {p.name}
                          </p>
                          <AdminBadge
                            variant={p.isActive ? 'dark' : 'muted'}
                          >
                            {p.isActive ? 'Active' : 'Draft'}
                          </AdminBadge>
                        </div>
                        <p className="text-xs font-mono text-[#6B7280] mt-1">
                          {p.sku} • {p.weight}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold text-[#111111]">
                            ₹{p.price}
                          </span>
                          {p.compareAtPrice > p.price && (
                            <span className="text-xs text-[#6B7280] line-through">
                              ₹{p.compareAtPrice}
                            </span>
                          )}
                          <span className="text-xs text-[#6B7280]">
                            • {p.categoryName || p.category?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E5E5]">
                      <div className="flex items-center gap-2">
                        <AdminBadge
                          variant={isLow ? 'danger' : 'success'}
                          dot
                        >
                          {p.stock} in stock
                        </AdminBadge>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickStockUpdate(
                              p._id || p.id,
                              p.stock,
                              10
                            )
                          }
                          className="min-h-[34px] px-2.5 py-1 rounded-md bg-white border border-[#111111] text-[#111111] text-xs font-semibold"
                        >
                          +10 Stock
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <AdminButton
                          variant="outline"
                          size="sm"
                          icon={Edit2}
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </AdminButton>
                        <AdminButton
                          variant="danger-outline"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteTarget(p)}
                          aria-label={`Delete ${p.name}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <AdminEmptyState
                icon={Package}
                title="No matching products"
                description="Try clearing your search filters or add a new formulation to the catalog."
                actionLabel="Add New Product"
                onAction={openCreateModal}
              />
            )}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="products"
          />
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      <AdminModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        subtitle="Catalog Management"
        title={
          activeModal === 'create'
            ? 'Create New Product'
            : `Edit Product: ${activeModal?.name || ''}`
        }
        maxWidth="max-w-3xl"
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
              form="admin-product-form"
              isLoading={isSaving}
              loadingText="Saving Product..."
              className="w-full sm:w-auto"
            >
              Save Formulation
            </AdminButton>
          </>
        }
      >
        <form
          id="admin-product-form"
          onSubmit={handleSaveProduct}
          className="space-y-5"
        >
          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminInput
              containerClassName="sm:col-span-2"
              label="Product Title"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Velvet Vanilla & Vitamin E Body Lotion — 200ml"
            />
            <AdminInput
              label="SKU Code"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              placeholder="e.g. AB-LOT-VAN-200"
              className="font-mono"
            />
          </div>

          {/* Category & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminSelect
              label="Category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>

            <AdminInput
              label="Selling Price (₹)"
              type="number"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="font-semibold"
            />

            <AdminInput
              label="Compare At Price (₹)"
              type="number"
              value={formData.compareAtPrice}
              onChange={(e) =>
                setFormData({ ...formData, compareAtPrice: e.target.value })
              }
            />

            <AdminInput
              label="Stock Units"
              type="number"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>

          {/* Product Photos Section */}
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-[13px] font-semibold text-[#111111] flex items-center gap-1.5">
                  <ImageIcon size={16} />
                  <span>
                    Product Photos (
                    {Array.isArray(formData.images)
                      ? formData.images.length
                      : 0}
                    )
                  </span>
                </label>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Upload product photos from your device or paste an image URL.
                  First photo is the primary cover image.
                </p>
              </div>

              <label
                className={`cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] text-white text-xs font-medium rounded-lg hover:bg-[#262626] transition-colors flex-shrink-0 ${
                  isUploadingImage ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {isUploadingImage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UploadCloud size={14} />
                )}
                <span>
                  {isUploadingImage ? 'Uploading...' : 'Upload Photos'}
                </span>
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-[#E5E5E5] bg-white"
                  >
                    <img
                      src={img}
                      alt={`Product preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/400x400?text=Invalid+Image';
                      }}
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#111111] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-white/95 hover:bg-red-600 text-[#111111] hover:text-white border border-[#E5E5E5] rounded-md p-1 transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#D4D4D4] rounded-lg p-6 text-center text-[#6B7280] bg-white">
                <UploadCloud
                  size={24}
                  className="mx-auto mb-1.5 text-[#6B7280]"
                />
                <p className="text-xs font-medium text-[#111111]">
                  No photos uploaded yet
                </p>
                <p className="text-[11px] mt-0.5">
                  Click &ldquo;Upload Photos&rdquo; above or paste an image URL
                  below
                </p>
              </div>
            )}

            {/* Add Image by URL fallback */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#E5E5E5]">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste external image URL (e.g. https://.../photo.jpg)"
                className="flex-1 min-h-[40px] px-3.5 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#111111]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomUrl();
                  }
                }}
              />
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={handleAddCustomUrl}
              >
                Add URL
              </AdminButton>
            </div>
          </div>

          {/* Badges & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminInput
              containerClassName="sm:col-span-2"
              label="Badges (comma-separated)"
              value={formData.badges}
              onChange={(e) =>
                setFormData({ ...formData, badges: e.target.value })
              }
              placeholder="BESTSELLER, HOT, NEW, -17%"
            />
            <AdminInput
              label="Net Weight / Volume"
              value={formData.weight || ''}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              placeholder="e.g. 200ml"
            />
          </div>

          {/* Descriptions */}
          <AdminInput
            label="Short Description"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
            placeholder="Brief single-line product summary"
          />

          <AdminTextarea
            label="Full Description"
            required
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminTextarea
              label="Botanical Ingredients"
              rows={2}
              value={formData.ingredients}
              onChange={(e) =>
                setFormData({ ...formData, ingredients: e.target.value })
              }
              className="font-mono text-xs"
            />
            <AdminTextarea
              label="How To Use"
              rows={2}
              value={formData.howToUse}
              onChange={(e) =>
                setFormData({ ...formData, howToUse: e.target.value })
              }
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#E5E5E5]">
            <AdminCheckbox
              label="Featured on Homepage"
              checked={Boolean(formData.isFeatured)}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
            />
            <AdminCheckbox
              label="Published (Active)"
              checked={Boolean(formData.isActive)}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
          </div>
        </form>
      </AdminModal>

      {/* DELETE CONFIRMATION MODAL */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDeleteProduct}
        isLoading={isDeleting}
        title="Delete Product Formulation"
        description="Are you sure you want to permanently delete this product? It will be immediately removed from the catalog, shop pages, and inventory."
        itemTitle={deleteTarget?.name}
        itemSubtitle={
          deleteTarget
            ? `SKU: ${deleteTarget.sku} • Price: ₹${deleteTarget.price} • Stock: ${deleteTarget.stock}`
            : ''
        }
        confirmLabel="Yes, Delete Product"
      />
    </div>
  );
};

export default AdminProducts;
