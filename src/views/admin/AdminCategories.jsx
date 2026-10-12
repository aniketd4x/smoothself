'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Layers, Search } from 'lucide-react';
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

const AdminCategories = () => {
  const { token, showToast } = useApp();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = () => {
    setIsLoading(true);
    fetch('/api/categories/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: 'Handcrafted botanical rituals for daily hydration.',
      image:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      order: categories.length + 1,
      isActive: true,
    });
    setActiveModal('create');
  };

  const openEditModal = (cat) => {
    setFormData(cat);
    setActiveModal(cat);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const editId =
        activeModal !== 'create' ? activeModal?._id || activeModal?.id : null;
      const isEdit = Boolean(editId);
      const url = isEdit ? `/api/categories/${editId}` : '/api/categories';
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
        showToast(isEdit ? 'Category updated!' : 'Category created!');
        setActiveModal(null);
        fetchCategories();
      } else {
        showToast(data.message || 'Error saving category', 'error');
      }
    } catch {
      showToast('Network error saving category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted');
        setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id));
        setDeleteTarget(null);
      } else {
        showToast(data.message || 'Error deleting category', 'error');
      }
    } catch {
      showToast('Error deleting category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories & Collections"
        subtitle="Organize catalog products into collections shown on storefront tabs and navigation."
        badge={`${categories.length} Collections`}
        actions={
          <AdminButton
            variant="primary"
            icon={Plus}
            onClick={openCreateModal}
            className="w-full sm:w-auto"
          >
            Add New Category
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
            placeholder="Search collections by name or slug..."
            className="w-full min-h-[40px] pl-10 pr-4 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-[13px] text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111] transition-colors"
          />
        </div>
        <span className="text-xs font-medium text-[#6B7280] hidden sm:inline">
          {filteredCategories.length} collections
        </span>
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading categories..." />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id || cat.id}
              className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden flex flex-col justify-between transition-colors hover:border-[#D4D4D4]"
            >
              <div>
                <div className="h-44 bg-[#F5F5F5] overflow-hidden relative border-b border-[#E5E5E5]">
                  <img
                    src={
                      cat.image ||
                      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <AdminBadge variant={cat.isActive ? 'dark' : 'muted'}>
                      {cat.isActive ? 'Active' : 'Draft'}
                    </AdminBadge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-[#111111]">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                    slug: {cat.slug}
                  </p>
                  <p className="text-[13px] text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-[#F5F5F5]/60 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                <span className="font-medium text-[#6B7280]">
                  Sort Order:{' '}
                  <strong className="text-[#111111]">{cat.order}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="outline"
                    size="xs"
                    icon={Edit2}
                    onClick={() => openEditModal(cat)}
                  >
                    Edit
                  </AdminButton>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="w-8 h-8 rounded-md border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                    aria-label={`Delete ${cat.name}`}
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
            icon={Layers}
            title="No categories found"
            description="Create a product category to organize your formulations."
            actionLabel="Add New Category"
            onAction={openCreateModal}
          />
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      <AdminModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        subtitle="Catalog Taxonomy"
        title={activeModal === 'create' ? 'Create Category' : 'Edit Category'}
        maxWidth="max-w-md"
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
              form="admin-category-form"
              isLoading={isSaving}
              loadingText="Saving..."
              className="w-full sm:w-auto"
            >
              Save Category
            </AdminButton>
          </>
        }
      >
        <form
          id="admin-category-form"
          onSubmit={handleSave}
          className="space-y-4"
        >
          <AdminInput
            label="Category Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g. Body Lotions"
          />

          <AdminTextarea
            label="Description"
            rows={2}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <AdminInput
            label="Cover Image URL"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            placeholder="https://..."
          />

          <AdminInput
            label="Display Sort Order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: Number(e.target.value) })
            }
          />

          <div className="pt-1">
            <AdminCheckbox
              label="Active on Storefront"
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
        title="Delete Category"
        description="Are you sure you want to delete this category? Products assigned to it will remain in your catalog."
        itemTitle={deleteTarget?.name}
        itemSubtitle={deleteTarget?.slug ? `slug: ${deleteTarget.slug}` : ''}
        confirmLabel="Delete Category"
      />
    </div>
  );
};

export default AdminCategories;
