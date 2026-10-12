'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, HelpCircle, Search } from 'lucide-react';
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
} from './components/AdminUI';

const AdminFAQs = () => {
  const { token, showToast } = useApp();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Products',
    order: 1,
    isActive: true,
  });

  const fetchFaqs = () => {
    setIsLoading(true);
    fetch('/api/faqs/all', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFaqs(data.faqs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/faqs/${activeModal._id}` : '/api/faqs';
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
        showToast(isEdit ? 'FAQ updated!' : 'FAQ added!');
        setActiveModal(null);
        fetchFaqs();
      } else {
        showToast(data.message || 'Error saving FAQ', 'error');
      }
    } catch {
      showToast('Error saving FAQ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/faqs/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('FAQ deleted');
        setFaqs((prev) => prev.filter((f) => f._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        showToast(data.message || 'Error deleting FAQ', 'error');
      }
    } catch {
      showToast('Error deleting FAQ', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory =
      categoryFilter === 'All' || f.category === categoryFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      f.question?.toLowerCase().includes(q) ||
      f.answer?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Frequently Asked Questions Management"
        subtitle="Answer questions regarding ingredients, dispatch timelines, and replacement policies."
        badge={`${faqs.length} Questions`}
        actions={
          <AdminButton
            variant="primary"
            icon={Plus}
            onClick={() => {
              setFormData({
                question: '',
                answer: '',
                category: 'Products',
                order: faqs.length + 1,
                isActive: true,
              });
              setActiveModal('create');
            }}
            className="w-full sm:w-auto"
          >
            Add New FAQ
          </AdminButton>
        }
      />

      {/* Category Filter Pills & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {['All', 'Products', 'Shipping', 'Orders', 'Payments', 'General'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F5F5F5] text-[#6B7280] hover:text-[#111111] border border-[#E5E5E5]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full min-h-[40px] pl-10 pr-3.5 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111]"
          />
        </div>
      </div>

      {isLoading && faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading FAQs..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {filteredFaqs.length > 0 ? (
            <div className="divide-y divide-[#E5E5E5]">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#F5F5F5]/40 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <AdminBadge variant="neutral">{faq.category}</AdminBadge>
                      {faq.order !== undefined && (
                        <span className="text-[11px] font-mono text-[#6B7280]">
                          #{faq.order}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-[#111111] leading-snug">
                      {faq.question}
                    </h4>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start flex-shrink-0">
                    <AdminButton
                      variant="outline"
                      size="xs"
                      icon={Edit2}
                      onClick={() => {
                        setFormData(faq);
                        setActiveModal(faq);
                      }}
                    >
                      Edit
                    </AdminButton>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(faq)}
                      className="w-8 h-8 rounded-md border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Delete FAQ ${faq.question}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              icon={HelpCircle}
              title="No FAQs found"
              description="Add frequently asked questions to assist customers on your storefront."
              actionLabel="Add New FAQ"
              onAction={() => {
                setFormData({
                  question: '',
                  answer: '',
                  category: 'Products',
                  order: faqs.length + 1,
                  isActive: true,
                });
                setActiveModal('create');
              }}
            />
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AdminModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        subtitle="Customer Support"
        title={activeModal === 'create' ? 'Add FAQ' : 'Edit FAQ'}
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
              form="admin-faq-form"
              isLoading={isSaving}
              loadingText="Saving..."
              className="w-full sm:w-auto"
            >
              Save FAQ
            </AdminButton>
          </>
        }
      >
        <form id="admin-faq-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <AdminSelect
              containerClassName="sm:col-span-2"
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="Products">Products</option>
              <option value="Shipping">Shipping</option>
              <option value="Orders">Orders</option>
              <option value="Payments">Payments</option>
              <option value="General">General</option>
            </AdminSelect>

            <AdminInput
              label="Sort Order"
              type="number"
              value={formData.order ?? 1}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
            />
          </div>

          <AdminInput
            label="Question"
            required
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            placeholder="e.g. Are your body lotions suitable for sensitive skin?"
          />

          <AdminTextarea
            label="Answer"
            required
            rows={4}
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
          />

          <div className="pt-1">
            <AdminCheckbox
              label="Active on FAQ Page"
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
        title="Delete FAQ Entry"
        description="Are you sure you want to permanently remove this FAQ from the storefront?"
        itemTitle={deleteTarget?.question}
        itemSubtitle={
          deleteTarget?.category ? `Category: ${deleteTarget.category}` : ''
        }
        confirmLabel="Delete FAQ"
      />
    </div>
  );
};

export default AdminFAQs;
