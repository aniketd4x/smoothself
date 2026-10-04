import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, X, HelpCircle } from 'lucide-react';

const AdminFAQs = () => {
  const { token, showToast } = useApp();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'Products', order: 1, isActive: true });

  const fetchFaqs = () => {
    setIsLoading(true);
    fetch('/api/faqs/all', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
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
    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/faqs/${activeModal._id}` : '/api/faqs';
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
        showToast(isEdit ? 'FAQ updated!' : 'FAQ added!');
        setActiveModal(null);
        fetchFaqs();
      }
    } catch {
      showToast('Error saving FAQ', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete FAQ?')) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('FAQ deleted');
        setFaqs(prev => prev.filter(f => f._id !== id));
      }
    } catch {
      showToast('Error deleting FAQ', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Frequently Asked Questions Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Answer questions regarding ingredients, dispatch timelines, and replacement policies.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ question: '', answer: '', category: 'Products', order: faqs.length + 1, isActive: true });
            setActiveModal('create');
          }}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition w-full sm:w-auto"
        >
          <Plus size={16} />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="divide-y divide-brand-border">
          {faqs.map((faq) => (
            <div key={faq._id} className="p-5 flex items-start justify-between gap-4 hover:bg-brand-surface/30 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
                  {faq.category}
                </span>
                <h4 className="font-serif text-base font-bold text-brand-primary">{faq.question}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{faq.answer}</p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setFormData(faq);
                    setActiveModal(faq);
                  }}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-4 sm:p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary">
                  {activeModal === 'create' ? 'Add FAQ' : 'Edit FAQ'}
                </h3>
                <button onClick={() => setActiveModal(null)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-brand-text mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                  >
                    <option value="Products">Products</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Orders">Orders</option>
                    <option value="Payments">Payments</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Question *</label>
                  <input
                    type="text"
                    required
                    value={formData.question}
                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Answer *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.answer}
                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg"
                  />
                </div>

                <div className="pt-3 border-t border-brand-border flex justify-end space-x-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="w-full sm:w-auto px-4 py-2.5 border rounded-lg text-center font-medium">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg shadow">Save FAQ</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;
