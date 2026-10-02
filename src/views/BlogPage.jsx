'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Calendar, User } from 'lucide-react';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(data => {
        if (data.success) setPosts(data.posts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
            The Botanical Journal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mt-1">
            Skin Rituals & Botanical Science
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-2">
            Expert formulation guides, ingredient spotlights, and mindful wellness rituals.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-brand-surface h-80 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-2xl overflow-hidden border border-brand-border hover:shadow-card transition flex flex-col justify-between group">
                <div>
                  <Link to={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-brand-surface">
                    <img
                      src={post.coverImage || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </Link>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center space-x-4 text-[11px] text-brand-muted mb-3">
                      <span className="flex items-center space-x-1">
                        <Calendar size={13} />
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <User size={13} />
                        <span>{post.author}</span>
                      </span>
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-primary leading-snug group-hover:text-brand-hover transition">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-3 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-primary hover:text-brand-hover uppercase tracking-wider"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogPage;
