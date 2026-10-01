import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, CheckCircle, Trash2, Check, X } from 'lucide-react';

const AdminReviews = () => {
  const { token, showToast } = useApp();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = () => {
    setIsLoading(true);
    fetch('/api/reviews/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setReviews(data.reviews);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const handleToggleApprove = async (id) => {
    try {
      const res = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Review approval toggled!`);
        setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: !r.isApproved } : r));
      }
    } catch {
      showToast('Error toggling review status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review removed');
        setReviews(prev => prev.filter(r => r._id !== id));
      }
    } catch {
      showToast('Error deleting review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Approve verified purchase reviews, respond to customer feedback, or remove spam.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review Text</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-brand-surface/40 transition">
                  <td className="p-4 font-bold text-brand-text">
                    {r.userName}
                    <span className="block text-[11px] font-normal text-brand-muted">{r.userEmail}</span>
                  </td>
                  <td className="p-4 text-brand-primary font-medium max-w-xs truncate">
                    {r.product?.name || 'Formulation'}
                  </td>
                  <td className="p-4">
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-brand-text truncate">{r.title}</p>
                    <p className="text-brand-muted text-[11px] line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="p-4 text-brand-muted">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleApprove(r._id)}
                      className="px-2.5 py-1 rounded bg-brand-surface hover:bg-brand-border text-brand-primary font-semibold text-xs"
                    >
                      {r.isApproved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
