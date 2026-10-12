'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, Trash2, Search } from 'lucide-react';
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingState,
} from './components/AdminUI';

const AdminReviews = () => {
  const { token, showToast } = useApp();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = () => {
    setIsLoading(true);
    fetch('/api/reviews/admin/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review approval toggled!');
        setReviews((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, isApproved: !r.isApproved } : r
          )
        );
      }
    } catch {
      showToast('Error toggling review status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review removed');
        setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        showToast(data.message || 'Error deleting review', 'error');
      }
    } catch {
      showToast('Error deleting review', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && r.isApproved) ||
      (statusFilter === 'pending' && !r.isApproved);
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.userName?.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Reviews Moderation"
        subtitle="Approve verified purchase reviews, monitor product ratings, or remove spam."
        badge={
          pendingCount > 0
            ? `${pendingCount} Pending`
            : `${reviews.length} Reviews`
        }
      />

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All (${reviews.length})` },
            {
              id: 'approved',
              label: `Approved (${reviews.length - pendingCount})`,
            },
            { id: 'pending', label: `Pending (${pendingCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F5F5F5] text-[#6B7280] hover:text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, product, review..."
            className="w-full min-h-[40px] pl-10 pr-3.5 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111]"
          />
        </div>
      </div>

      {isLoading && reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading customer reviews..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Rating</th>
                  <th className="py-3.5 px-5">Review Text</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-[#F5F5F5]/60 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-[#111111]">
                          {r.userName}
                        </p>
                        <span className="block text-xs text-[#6B7280]">
                          {r.userEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#111111] font-medium max-w-[180px] truncate">
                        {r.product?.name || 'Formulation'}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-0.5 text-[#111111]">
                          {[...Array(Number(r.rating) || 5)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 max-w-xs">
                        <p className="font-semibold text-[#111111] truncate">
                          {r.title}
                        </p>
                        <p className="text-[#6B7280] text-xs line-clamp-2 mt-0.5 leading-relaxed">
                          {r.comment}
                        </p>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#6B7280] whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <AdminBadge
                          variant={r.isApproved ? 'success' : 'warning'}
                          dot
                        >
                          {r.isApproved ? 'Approved' : 'Pending'}
                        </AdminBadge>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <AdminButton
                            variant={r.isApproved ? 'outline' : 'primary'}
                            size="xs"
                            onClick={() => handleToggleApprove(r._id)}
                          >
                            {r.isApproved ? 'Unapprove' : 'Approve'}
                          </AdminButton>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r)}
                            className="w-8 h-8 rounded-md border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Delete review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <AdminEmptyState
                        icon={Star}
                        title="No reviews found"
                        description="Customer reviews matching your filter will appear here."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-[#E5E5E5]">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((r) => (
                <div key={r._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {r.userName}
                      </p>
                      <p className="text-xs text-[#6B7280]">{r.userEmail}</p>
                    </div>
                    <AdminBadge
                      variant={r.isApproved ? 'success' : 'warning'}
                      dot
                    >
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </AdminBadge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#111111] truncate max-w-[65%]">
                      {r.product?.name || 'Formulation'}
                    </span>
                    <div className="flex items-center gap-0.5 text-[#111111]">
                      {[...Array(Number(r.rating) || 5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] space-y-1">
                    {r.title && (
                      <p className="text-xs font-semibold text-[#111111]">
                        {r.title}
                      </p>
                    )}
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {r.comment}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#6B7280]">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant={r.isApproved ? 'secondary' : 'primary'}
                        size="xs"
                        onClick={() => handleToggleApprove(r._id)}
                      >
                        {r.isApproved ? 'Unapprove' : 'Approve'}
                      </AdminButton>
                      <AdminButton
                        variant="danger-outline"
                        size="xs"
                        icon={Trash2}
                        onClick={() => setDeleteTarget(r)}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <AdminEmptyState
                icon={Star}
                title="No reviews found"
                description="Customer reviews matching your filter will appear here."
              />
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Customer Review"
        description="Are you sure you want to permanently delete this customer review?"
        itemTitle={deleteTarget?.title || deleteTarget?.userName}
        itemSubtitle={deleteTarget?.comment}
        confirmLabel="Delete Review"
      />
    </div>
  );
};

export default AdminReviews;
