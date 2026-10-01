import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react';

const AdminBlog = () => {
  const { token, showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: 'Botanical Formulations Team',
    tags: 'Hydration, Botanicals',
    published: true
  });

  const fetchPosts = () => {
    setIsLoading(true);
    fetch('/api/blogs/admin/all', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
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
      coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      author: 'Botanical Formulations Team',
      tags: 'Skincare, Botanicals',
      published: true
    });
    setActiveModal('create');
  };

  const openEditModal = (post) => {
    setFormData({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags
    });
    setActiveModal(post);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(s => s.trim()) : formData.tags
    };

    try {
      const isEdit = activeModal !== 'create' && activeModal?._id;
      const url = isEdit ? `/api/blogs/${activeModal._id}` : '/api/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Article updated!' : 'Article published!');
        setActiveModal(null);
        fetchPosts();
      }
    } catch {
      showToast('Error saving article', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete article?')) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Article deleted');
        setPosts(prev => prev.filter(p => p._id !== id));
      }
    } catch {
      showToast('Error deleting article', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
            Botanical Journal & Blog Posts
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Publish educational skincare guides, ingredient spotlights, and SEO articles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition"
        >
          <Plus size={16} />
          <span>Write New Article</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Article</th>
                <th className="p-4">Author</th>
                <th className="p-4">Published Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {posts.map((p) => (
                <tr key={p._id} className="hover:bg-brand-surface/40 transition">
                  <td className="p-4">
                    <p className="font-bold text-brand-primary line-clamp-1">{p.title}</p>
                    <p className="text-[11px] font-mono text-brand-muted">slug: {p.slug}</p>
                  </td>
                  <td className="p-4 text-brand-muted">{p.author}</td>
                  <td className="p-4 text-brand-muted">
                    {new Date(p.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary">
                  {activeModal === 'create' ? 'Write Article' : 'Edit Article'}
                </h3>
                <button onClick={() => setActiveModal(null)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-brand-text mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Author Name</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={e => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Short Excerpt</label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">Article Content *</label>
                  <textarea
                    rows={6}
                    required
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="pt-3 border-t border-brand-border flex justify-end space-x-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg shadow">Save & Publish</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
