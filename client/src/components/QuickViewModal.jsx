import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';

const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const images = product.images?.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'
  ];

  const variants = product.variants?.[0]?.options || [];
  const activeVariant = selectedVariant || variants[0];
  const activePrice = activeVariant?.price || product.price;
  const activeComparePrice = activeVariant?.compareAtPrice || product.compareAtPrice;

  const handleAdd = () => {
    setIsAdding(true);
    addToCart(product, quantity, activeVariant);
    setTimeout(() => {
      setIsAdding(false);
      setQuickViewProduct(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in z-10">
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 text-gray-400 hover:text-brand-primary p-1.5 rounded-full bg-white/80 hover:bg-white shadow transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery */}
            <div className="p-6 bg-brand-surface/50 flex flex-col justify-between">
              <div className="aspect-square rounded-lg overflow-hidden bg-[#faf9f8] border border-brand-border flex items-center justify-center p-4">
                <img
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-md overflow-hidden border-2 flex-shrink-0 transition bg-[#faf9f8] flex items-center justify-center p-1 ${
                        selectedImage === idx ? 'border-brand-primary' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Options */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  {product.categoryName || 'Body Care'}
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-primary mt-1">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center space-x-1.5 mt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-brand-muted">
                    {product.rating || 4.9} ({product.numReviews || 12} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline space-x-3 mt-3">
                  <span className="text-2xl font-bold text-brand-primary">
                    ₹{activePrice}
                  </span>
                  {activeComparePrice > activePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{activeComparePrice}
                    </span>
                  )}
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Tax Included
                  </span>
                </div>

                <p className="text-xs text-brand-muted mt-3 line-clamp-3 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                {/* Variants Picker */}
                {variants.length > 0 && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-brand-text block mb-1.5">
                      Select {product.variants[0].name}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-1.5 text-xs font-medium rounded border transition ${
                            activeVariant?.title === v.title
                              ? 'border-brand-primary bg-brand-primary text-white'
                              : 'border-brand-border bg-white text-brand-text hover:border-brand-primary'
                          }`}
                        >
                          {v.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-5 flex items-center space-x-4">
                  <div className="flex items-center border border-brand-border rounded-lg bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-brand-text hover:text-brand-primary text-sm font-semibold"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-brand-text">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3 py-2 text-brand-text hover:text-brand-primary text-sm font-semibold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
                    <Check size={14} />
                    <span>In Stock & Ready to Ship</span>
                  </span>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <div className="mt-6 pt-4 border-t border-brand-border space-y-3">
                <button
                  onClick={handleAdd}
                  disabled={isAdding}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold rounded-lg shadow-md transition duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={17} />
                  <span>{isAdding ? 'Adding to Bag...' : `Add to Bag • ₹${activePrice * quantity}`}</span>
                </button>

                <div className="text-center">
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="text-xs font-medium text-brand-primary hover:underline"
                  >
                    View Full Product Details & Reviews →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
