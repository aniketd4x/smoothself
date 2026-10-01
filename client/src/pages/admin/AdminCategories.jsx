import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Layers, X } from 'lucide-react';

const AdminCategories = () => {
  const { token, showToast } = useApp();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', order: 0, isActive: true });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = () => {
    setIsLoading(true);
    fetch('/api/categories/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
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
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      order: categories.length + 1,
      isActive: true
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
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/categories/${activeModal._id}` : '/api/categories';
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted');
        setCategories(prev => prev.filter(c => c._id !== id));
      }
    } catch {
      showToast('Error deleting category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Categories & Collections
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Organize catalog products into collections shown on tabs and navigation.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-40 bg-brand-surface overflow-hidden relative">
                <img src={cat.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-bold text-brand-primary">{cat.name}</h3>
                <p className="text-[11px] font-mono text-brand-muted mt-0.5">slug: {cat.slug}</p>
                <p className="text-xs text-brand-muted mt-2 line-clamp-2">{cat.description}</p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-brand-border/60 flex items-center justify-between text-xs">
              <span className="text-brand-muted">Order: {cat.order}</span>
              <div className="space-x-2">
                <button onClick={() => openEditModal(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
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
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary">
                  {activeModal === 'create' ? 'Create Category' : `Edit Category`}
                </h3>
                <button onClick={() => setActiveModal(null)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-brand-text mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-brand-border flex justify-end space-x-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-5 py-2 bg-brand-primary text-white rounded-lg">
                    {isSaving ? 'Saving...' : 'Save Category'}
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

export default AdminCategories;
