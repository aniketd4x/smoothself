'use client';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPost(data.post);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-primary">Article Not Found</h2>
        <Link to="/blog" className="text-xs font-semibold text-brand-primary underline mt-4 inline-block">
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <Link to="/blog" className="inline-flex items-center space-x-1.5 text-xs text-brand-muted hover:text-brand-primary font-medium mb-8">
          <ArrowLeft size={14} />
          <span>Back to Journal</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center space-x-4 text-xs text-brand-muted my-6 pb-6 border-b border-brand-border">
          <span className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <User size={14} />
            <span>{post.author}</span>
          </span>
        </div>

        {post.coverImage && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 border border-brand-border bg-brand-surface shadow-sm">
            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-brand-muted leading-relaxed space-y-4">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex justify-between items-center">
          <Link to="/blog" className="text-xs font-bold text-brand-primary hover:underline">
            ← Read More Articles
          </Link>
          <Link to="/shop" className="px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-full shadow">
            Shop Formulations
          </Link>
        </div>

      </div>
    </div>
  );
};

export default BlogPostPage;
