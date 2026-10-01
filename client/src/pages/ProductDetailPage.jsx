import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  CheckCircle,
  Share2
} from 'lucide-react';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useApp();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion drawer states
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    ingredients: false,
    howToUse: false,
    shipping: false
  });

  // Sticky Bar visibility on scroll
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    userName: '',
    userEmail: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch product data & reviews
  useEffect(() => {
    setIsLoading(true);
    setSelectedImage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          if (data.product.variants?.[0]?.options?.length > 0) {
            setSelectedVariant(data.product.variants[0].options[0]);
          }

          // Fetch reviews for this product
          fetch(`/api/reviews/product/${data.product._id}`)
            .then(r => r.json())
            .then(revData => {
              if (revData.success) setReviews(revData.reviews);
            })
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Scroll handler for sticky bottom Add-to-Cart bar
  useEffect(() => {
    const handleScroll = () => {
      const buyBox = document.getElementById('main-buy-box');
      if (buyBox) {
        const rect = buyBox.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews/product/${product._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewFormData)
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setShowReviewForm(false);
        setReviewFormData({ userName: '', userEmail: '', rating: 5, title: '', comment: '' });
        showToast('Thank you! Your verified review has been submitted.');
      } else {
        showToast(data.message || 'Could not submit review', 'error');
      }
    } catch {
      showToast('Error submitting review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-primary mb-3">Product Not Found</h2>
        <p className="text-sm text-brand-muted mb-6">The requested formulation may have been moved or updated.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-full">
          Browse All Products
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
  ];

  const variants = product.variants?.[0]?.options || [];
  const activePrice = selectedVariant?.price || product.price;
  const activeComparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const discountPercent = activeComparePrice > activePrice
    ? Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100)
    : 0;

  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-white">
      {/* 1. BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-brand-border/60">
        <nav className="flex items-center space-x-2 text-xs text-brand-muted">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="hover:text-brand-primary">Shop</Link>
          <ChevronRight size={13} />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category.slug || ''}`} className="hover:text-brand-primary">
                {product.categoryName || 'Collection'}
              </Link>
              <ChevronRight size={13} />
            </>
          )}
          <span className="text-brand-primary font-semibold truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* 2. MAIN PRODUCT SECTION (2-COLUMNS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: GALLERY COLUMN (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 items-start">
            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[550px] pb-2 md:pb-0 md:w-20 flex-shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 aspect-square rounded-lg overflow-hidden border-2 flex-shrink-0 transition bg-[#faf9f8] flex items-center justify-center p-1.5 ${
                      selectedImage === idx ? 'border-brand-primary shadow-sm' : 'border-brand-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image (Maintains actual image size & 1:1 aspect ratio on desktop) */}
            <div className="flex-1 relative aspect-square bg-[#faf9f8] rounded-2xl overflow-hidden border border-brand-border flex items-center justify-center p-4 sm:p-6 lg:p-8 max-w-[620px]">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.badges?.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded bg-brand-primary text-white uppercase shadow-sm"
                  >
                    {badge}
                  </span>
                ))}
                {discountPercent > 0 && (
                  <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded bg-brand-sale text-white uppercase shadow-sm">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${
                  inWishlist ? 'bg-brand-sale text-white' : 'bg-white text-brand-text hover:text-brand-sale'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>

              <img
                src={images[selectedImage]}
                alt={product.name}
                className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 hover:scale-105 select-none"
              />
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & BUY BOX (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col justify-between" id="main-buy-box">
            <div>
              {/* Category */}
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
                {product.categoryName || 'Botanical Body Care'}
              </span>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-primary mt-1.5 leading-snug">
                {product.name}
              </h1>

              {/* Star Rating & Review Anchor */}
              <div className="flex items-center space-x-2 mt-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-brand-primary">
                  {product.rating || 4.9}
                </span>
                <span className="text-xs text-brand-muted">•</span>
                <a href="#customer-reviews" className="text-xs text-brand-muted hover:text-brand-primary underline">
                  {reviews.length || product.numReviews || 12} Customer Reviews
                </a>
              </div>

              {/* Price Block */}
              <div className="mt-4 pt-4 border-t border-brand-border/60">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-brand-primary">
                    ₹{activePrice}.00
                  </span>
                  {activeComparePrice > activePrice && (
                    <span className="text-base text-gray-400 line-through">
                      ₹{activeComparePrice}.00
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-brand-sale bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      -{discountPercent}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-muted mt-1">
                  Tax included. Free shipping on orders above ₹450.
                </p>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mt-4">
                {product.shortDescription || product.description}
              </p>

              {/* Variant Picker (Sizes / Scents) */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                      Select {product.variants[0].name}: <span className="text-brand-primary font-normal">{selectedVariant?.title}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition ${
                          selectedVariant?.title === v.title
                            ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                            : 'border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary'
                        }`}
                      >
                        {v.title} — ₹{v.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Indicator */}
              <div className="mt-5 flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-700 font-medium">
                  {product.stock > 10 ? 'In Stock — Dispatches within 24 Hours' : `Only ${product.stock} items left in stock!`}
                </span>
              </div>

              {/* Quantity Selector & Primary Buy Buttons */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-brand-border rounded-lg bg-white h-12">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3.5 h-full text-brand-text hover:text-brand-primary font-bold transition"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-brand-text">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3.5 h-full text-brand-text hover:text-brand-primary font-bold transition"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 h-12 bg-white border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-semibold text-sm rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Bag • ₹{activePrice * quantity}</span>
                  </button>
                </div>

                {/* Instant Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Buy It Now</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="mt-8 pt-6 border-t border-brand-border/60 grid grid-cols-3 gap-2 text-center text-xs text-brand-muted">
                <div className="flex flex-col items-center">
                  <Truck size={18} className="text-brand-primary mb-1" />
                  <span className="font-semibold text-brand-text">Free Shipping</span>
                  <span className="text-[10px]">Above ₹450 order</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={18} className="text-brand-primary mb-1" />
                  <span className="font-semibold text-brand-text">30-Day Returns</span>
                  <span className="text-[10px]">Return or exchange</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={18} className="text-brand-primary mb-1" />
                  <span className="font-semibold text-brand-text">100% Authentic</span>
                  <span className="text-[10px]">Clean & Non-toxic</span>
                </div>
              </div>

            </div>

            {/* 3. COLLAPSIBLE ACCORDION DRAWERS */}
            <div className="mt-10 border-t border-brand-border divide-y divide-brand-border">
              {/* Accordion 1: Description */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-brand-primary"
                >
                  <span>Formulation Story & Benefits</span>
                  {openAccordions.description ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordions.description && (
                  <div className="mt-3 text-xs sm:text-sm text-brand-muted leading-relaxed space-y-2 animate-fade-in">
                    <p>{product.description}</p>
                    {product.benefits?.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        {product.benefits.map((b, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="text-brand-primary font-bold">•</span>
                            <p><strong>{b.title}:</strong> {b.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Ingredients */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('ingredients')}
                  className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-brand-primary"
                >
                  <span>Full Botanical Ingredients List</span>
                  {openAccordions.ingredients ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordions.ingredients && (
                  <div className="mt-3 text-xs text-brand-muted leading-relaxed animate-fade-in">
                    <p className="bg-brand-surface p-3.5 rounded-lg border border-brand-border/60 font-mono text-[11px]">
                      {product.ingredients || 'Aqua, Sweet Almond Oil, Madagascar Vanilla Pod Extract, Tocopheryl Acetate (Vitamin E), Shea Butter, Plant Squalane.'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Zero parabens, sulfates, silicones, synthetic mineral oils, or phthalates.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: How to Use */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('howToUse')}
                  className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-brand-primary"
                >
                  <span>How to Apply & Rituals</span>
                  {openAccordions.howToUse ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordions.howToUse && (
                  <div className="mt-3 text-xs sm:text-sm text-brand-muted leading-relaxed animate-fade-in">
                    <p>{product.howToUse || 'Smooth generously over cleansed skin post-shower or bath. Pay special attention to dry areas like elbows, knees, and ankles. Suitable for everyday use.'}</p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Shipping & Returns */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-brand-primary"
                >
                  <span>Shipping & Returns</span>
                  {openAccordions.shipping ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openAccordions.shipping && (
                  <div className="mt-3 text-xs sm:text-sm text-brand-muted leading-relaxed space-y-2 animate-fade-in">
                    <p>• <strong>Shipping:</strong> Weight-based shipping calculated at checkout. Free shipping on orders above ₹450.</p>
                    <p>• <strong>Delivery Timelines:</strong> 2 to 5 business days across India.</p>
                    <p>• <strong>30-Day Hassle-Free Returns:</strong> Return or exchange your order within 30 days of delivery. Shop with complete confidence and peace of mind on every order.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 4. CUSTOMER REVIEWS SECTION */}
      <section id="customer-reviews" className="py-16 bg-brand-surface/30 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-brand-border gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
                Customer Reviews
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-bold text-brand-primary">
                  {product.rating || 4.9} out of 5
                </span>
                <span className="text-xs text-brand-muted">
                  ({reviews.length} verified reviews)
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-full transition self-start md:self-auto"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* INLINE WRITE A REVIEW FORM */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-12 p-6 md:p-8 bg-white rounded-xl border border-brand-border shadow-sm max-w-2xl mx-auto animate-fade-in space-y-4">
              <h3 className="font-serif text-lg font-bold text-brand-primary">Share Your Experience</h3>
              
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Rating</label>
                <div className="flex space-x-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star size={22} fill={star <= reviewFormData.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewFormData.userName}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, userName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={reviewFormData.userEmail}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, userEmail: e.target.value })}
                    placeholder="e.g. priya@example.com"
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Review Headline</label>
                <input
                  type="text"
                  value={reviewFormData.title}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                  placeholder="e.g. Silky smooth skin & gorgeous fragrance!"
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Review Comment *</label>
                <textarea
                  rows={4}
                  required
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  placeholder="How does your skin feel? What did you think of the scent and texture?"
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* REVIEWS LIST */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="p-6 bg-white rounded-xl border border-brand-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} stroke="currentColor" />
                      ))}
                    </div>
                    <span className="text-[11px] text-brand-muted">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {rev.title && (
                    <h4 className="text-sm font-bold text-brand-primary mb-1">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                    {rev.comment}
                  </p>

                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs font-semibold text-brand-text">{rev.userName}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                      <CheckCircle size={10} />
                      <span>Verified Buyer</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-xl border border-brand-border">
                <p className="text-xs text-brand-muted">Be the first to review this formulation!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. RELATED PRODUCTS CAROUSEL */}
      {relatedProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-t border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary mb-8 text-center">
              Pairs Beautifully With
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. STICKY ADD-TO-CART BOTTOM BAR ON SCROLL */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-brand-border shadow-2xl py-3 px-4 z-40 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={images[0]}
                alt=""
                className="w-11 h-12 object-cover rounded-md border border-brand-border hidden sm:block"
              />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-brand-primary line-clamp-1">
                  {product.name}
                </h4>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xs sm:text-sm font-bold text-brand-primary">
                    ₹{activePrice}
                  </span>
                  {selectedVariant && (
                    <span className="text-[11px] text-brand-muted">
                      ({selectedVariant.title})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition"
              >
                Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="hidden sm:block px-5 py-2.5 bg-brand-surface hover:bg-brand-border text-brand-primary border border-brand-border text-xs sm:text-sm font-semibold rounded-lg transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailPage;
