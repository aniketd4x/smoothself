'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react';
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

const AdminBlog = () => {
  const { token, showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: 'Botanical Formulations Team',
    tags: 'Hydration, Botanicals',
    published: true,
  });

  const fetchPosts = () => {
    setIsLoading(true);
    fetch('/api/blogs/admin/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPosts(data.posts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const openCreateModal = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      coverImage:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      author: 'Botanical Formulations Team',
      tags: 'Skincare, Botanicals',
      published: true,
    });
    setActiveModal('create');
  };

  const openEditModal = (post) => {
    setFormData({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
    });
    setActiveModal(post);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...formData,
      tags:
        typeof formData.tags === 'string'
          ? formData.tags.split(',').map((s) => s.trim())
          : formData.tags,
    };

    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/blogs/${activeModal._id}` : '/api/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Article updated!' : 'Article published!');
        setActiveModal(null);
        fetchPosts();
      } else {
        showToast(data.message || 'Error saving article', 'error');
      }
    } catch {
      showToast('Error saving article', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Article deleted');
        setPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        showToast(data.message || 'Error deleting article', 'error');
      }
    } catch {
      showToast('Error deleting article', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Botanical Journal & Blog Posts"
        subtitle="Publish educational skincare guides, ingredient spotlights, and SEO articles."
        badge={`${posts.length} Articles`}
        actions={
          <AdminButton
            variant="primary"
            icon={Plus}
            onClick={openCreateModal}
            className="w-full sm:w-auto"
          >
            Write New Article
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
            placeholder="Search articles by title, author, or slug..."
            className="w-full min-h-[40px] pl-10 pr-4 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-[13px] text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111] transition-colors"
          />
        </div>
        <span className="text-xs font-medium text-[#6B7280] hidden sm:inline">
          {filteredPosts.length} articles
        </span>
      </div>

      {isLoading && posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading journal articles..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Article</th>
                  <th className="py-3.5 px-5">Author</th>
                  <th className="py-3.5 px-5">Published Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-[#F5F5F5]/60 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-[#111111] line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                          slug: {p.slug}
                        </p>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#6B7280]">
                        {p.author}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#6B7280]">
                        {new Date(p.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <AdminBadge variant={p.published ? 'dark' : 'muted'}>
                          {p.published ? 'Live' : 'Draft'}
                        </AdminBadge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="w-9 h-9 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#F5F5F5] text-[#111111] inline-flex items-center justify-center transition-colors cursor-pointer"
                            aria-label={`Edit ${p.title}`}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="w-9 h-9 rounded-lg border border-[#E5E5E5] bg-white hover:border-red-200 hover:bg-red-50 text-[#6B7280] hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                            aria-label={`Delete ${p.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <AdminEmptyState
                        icon={BookOpen}
                        title="No journal articles found"
                        description="Write and publish educational articles for your storefront journal."
                        actionLabel="Write New Article"
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
            {filteredPosts.length > 0 ? (
              filteredPosts.map((p) => (
                <div key={p._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111111] line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-xs font-mono text-[#6B7280] mt-0.5 truncate">
                        slug: {p.slug}
                      </p>
                    </div>
                    <AdminBadge variant={p.published ? 'dark' : 'muted'}>
                      {p.published ? 'Live' : 'Draft'}
                    </AdminBadge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                    <span>
                      {p.author} •{' '}
                      {new Date(p.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="outline"
                        size="xs"
                        icon={Edit2}
                        onClick={() => openEditModal(p)}
                      >
                        Edit
                      </AdminButton>
                      <AdminButton
                        variant="danger-outline"
                        size="xs"
                        icon={Trash2}
                        onClick={() => setDeleteTarget(p)}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <AdminEmptyState
                icon={BookOpen}
                title="No journal articles found"
                description="Write and publish educational articles for your storefront journal."
                actionLabel="Write New Article"
                onAction={openCreateModal}
              />
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AdminModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        subtitle="Editorial Journal"
        title={activeModal === 'create' ? 'Write Article' : 'Edit Article'}
        maxWidth="max-w-2xl"
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
              form="admin-blog-form"
              isLoading={isSaving}
              loadingText="Saving..."
              className="w-full sm:w-auto"
            >
              Save & Publish
            </AdminButton>
          </>
        }
      >
        <form
          id="admin-blog-form"
          onSubmit={handleSave}
          className="space-y-4"
        >
          <AdminInput
            label="Article Title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AdminInput
              label="Author Name"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
            <AdminInput
              label="Cover Image URL"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
            />
          </div>

          <AdminInput
            label="Tags (comma-separated)"
            value={formData.tags || ''}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            placeholder="Skincare, Botanicals, Hydration"
          />

          <AdminTextarea
            label="Short Excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
          />

          <AdminTextarea
            label="Article Content"
            required
            rows={6}
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="font-mono text-xs"
          />

          <div className="pt-1">
            <AdminCheckbox
              label="Published (Visible in Storefront Journal)"
              checked={formData.published !== false}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
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
        title="Delete Journal Article"
        description="Are you sure you want to permanently delete this blog article?"
        itemTitle={deleteTarget?.title}
        itemSubtitle={deleteTarget?.slug ? `slug: ${deleteTarget.slug}` : ''}
        confirmLabel="Delete Article"
      />
    </div>
  );
};

export default AdminBlog;
