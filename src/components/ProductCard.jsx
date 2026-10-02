'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop';
  const secondaryImage = product.images?.[1] || primaryImage;

  const inWishlist = isInWishlist(product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-brand-border/60 hover:border-brand-border hover:shadow-card transition duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. MEDIA CONTAINER */}
      <div className="relative w-full aspect-square bg-[#faf9f8] overflow-hidden flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.badges && product.badges.map((badge, idx) => {
            let badgeBg = 'bg-brand-primary text-white';
            if (badge.includes('-') || badge.includes('%') || badge === 'SALE') {
              badgeBg = 'bg-brand-sale text-white';
            } else if (badge === 'HOT') {
              badgeBg = 'bg-purple-600 text-white';
            } else if (badge === 'NEW') {
              badgeBg = 'bg-emerald-600 text-white';
            }
            return (
              <span
                key={idx}
                className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase shadow-sm ${badgeBg}`}
              >
                {badge}
              </span>
            );
          })}
        </div>

        {/* Quick Action Floating Buttons (Wishlist, Quick View) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product._id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${
              inWishlist
                ? 'bg-brand-sale text-white'
                : 'bg-white text-brand-text hover:text-brand-sale'
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-8 h-8 rounded-full bg-white text-brand-text hover:text-brand-primary flex items-center justify-center shadow-md transition opacity-0 group-hover:opacity-100"
            aria-label="Quick View"
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Product Image Swap on Hover */}
        <Link to={`/product/${product.slug}`} className="flex items-center justify-center w-full h-full p-4">
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105 select-none"
            loading="lazy"
          />
        </Link>

        {/* Quick Add Overlay Bar on Hover (Mobile friendly button below) */}
        <div className="absolute bottom-0 inset-x-0 p-3 hidden sm:block translate-y-full group-hover:translate-y-0 transition duration-300 bg-gradient-to-t from-black/20 to-transparent">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || product.stock <= 0}
            className="w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-md shadow-lg transition duration-200 flex items-center justify-center space-x-1.5"
          >
            {isAdding ? (
              <>
                <Check size={14} />
                <span>Added!</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PRODUCT DETAILS */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            {product.categoryName || 'Body Care'}
          </span>

          {/* Title */}
          <h3 className="font-sans text-sm font-semibold text-brand-primary mt-1 line-clamp-2 hover:text-brand-hover transition">
            <Link to={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Star Rating */}
          <div className="flex items-center space-x-1 mt-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                />
              ))}
            </div>
            <span className="text-xs font-medium text-brand-muted">
              ({product.numReviews || 12})
            </span>
          </div>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm md:text-base font-bold text-brand-primary">
              ₹{product.price}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.compareAtPrice}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || product.stock <= 0}
            className="sm:hidden p-2 rounded-full bg-brand-surface text-brand-primary hover:bg-brand-primary hover:text-white transition"
            aria-label="Add to cart"
          >
            {isAdding ? <Check size={16} /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
