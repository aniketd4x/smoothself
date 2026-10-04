'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Droplets,
  Sparkles,
  Wind,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Star,
  CheckCircle,
  Truck,
  RotateCcw,
  Clock,
  ShoppingBag
} from 'lucide-react';

const heroStrawberryImg = '/hero_strawberry.jpg';
const heroVanillaImg = '/hero_vanilla.jpg';
const heroStrawberryMobileImg = '/hero_strawberry_mobile.jpg';
const heroVanillaMobileImg = '/hero_vanilla_mobile.jpg';
const editorialDuoImg = '/editorial_duo_lotions.jpg';

const DEFAULT_BANNERS = [
  {
    _id: 'default-strawberry',
    title: 'Strawberry & Vitamin E Body Lotion',
    subtitle: 'Instant Radiance, Skin Brightening & 24-Hour Hydration with Pure Strawberry Extracts.',
    tagline: 'SMOOTHSELF SIGNATURE COLLECTION • 200ML',
    buttonText: 'Shop Strawberry — ₹249',
    buttonLink: '/product/strawberry-lotion',
    imageUrl: heroStrawberryImg,
    mobileImageUrl: heroStrawberryMobileImg
  },
  {
    _id: 'default-vanilla',
    title: 'Vanilla & Vitamin E Body Lotion',
    subtitle: 'Calming Delicate Vanilla Fragrance, Deep Hydration & Velvety Soft Skin for All Skin Types.',
    tagline: 'DAILY-USE FORMULA • 200ML • CALMING COMFORT',
    buttonText: 'Shop Vanilla — ₹249',
    buttonLink: '/product/vanilla-body-lotion',
    imageUrl: heroVanillaImg,
    mobileImageUrl: heroVanillaMobileImg
  }
];

const DEFAULT_PRODUCTS = [
  {
    _id: 'prod-vanilla-200',
    name: 'Vanilla & Vitamin E Body Lotion — 200ml',
    slug: 'vanilla-body-lotion',
    price: 249,
    compareAtPrice: 299,
    images: ['/uploads/1_119e1d29-aca2-4ca0-8362-37de-1790868403485-554707.webp', heroVanillaImg],
    badges: ['BESTSELLER', 'HOT'],
    rating: 4.9,
    numReviews: 48,
    stock: 100,
    shortDescription: 'Deep 24-hour hydration infused with Madagascar Vanilla and Vitamin E for velvety soft skin.'
  },
  {
    _id: 'prod-strawberry-200',
    name: 'Strawberry & Vitamin E Body Lotion — 200ml',
    slug: 'strawberry-lotion',
    price: 249,
    compareAtPrice: 299,
    images: ['/uploads/1_d9f975a2-2422-4fcb-a85e-7d69-1790868473669-57591.webp', heroStrawberryImg],
    badges: ['NEW', 'RADIANCE'],
    rating: 4.9,
    numReviews: 36,
    stock: 100,
    shortDescription: 'Pure strawberry fruit extracts actively brighten, tone, and impart a juicy dewy glow.'
  }
];

const HomePage = () => {
  const { settings, addToCart, setIsCartOpen } = useApp();
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products and banners gracefully
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success && data.products?.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});

    fetch('/api/banners')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success && data.banners?.length > 0) {
          const resolved = data.banners.map((b) => {
            let img = b.imageUrl;
            let mobImg = b.mobileImageUrl;
            if (img === '/hero_strawberry.jpg' || img?.includes('strawberry')) {
              img = heroStrawberryImg;
              mobImg = mobImg || heroStrawberryMobileImg;
            } else if (img === '/hero_vanilla.jpg' || img?.includes('vanilla')) {
              img = heroVanillaImg;
              mobImg = mobImg || heroVanillaMobileImg;
            }
            return {
              ...b,
              imageUrl: img,
              mobileImageUrl: mobImg || img
            };
          });
          setBanners(resolved);
        }
      })
      .catch(() => {});
  }, []);

  // Slide auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="w-full">
      {/* 1. HERO SLIDESHOW SECTION */}
      <section className="relative w-full h-[76vh] sm:h-[75vh] md:h-[82vh] min-h-[520px] bg-brand-primary overflow-hidden">
        {banners.map((banner, index) => {
          const desktopImg = banner.imageUrl || (index === 0 ? heroStrawberryImg : heroVanillaImg);
          const mobileImg = banner.mobileImageUrl || (index === 0 ? heroStrawberryMobileImg : heroVanillaMobileImg);

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background Image: Responsive Desktop & Mobile with <picture> */}
              <div className="absolute inset-0 overflow-hidden">
                <picture className="w-full h-full">
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileImg || desktopImg}
                  />
                  <img
                    src={desktopImg}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center select-none"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      if (e.currentTarget.src !== desktopImg) {
                        e.currentTarget.src = desktopImg;
                      } else {
                        e.currentTarget.src = heroStrawberryImg;
                      }
                    }}
                  />
                </picture>
                {/* Adaptive Dark Vignette: vertical on mobile for readability, horizontal on desktop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/45 sm:to-transparent"></div>
              </div>

              {/* Slide Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end sm:items-center pb-14 sm:pb-0">
                <div className="max-w-xl text-white space-y-3 sm:space-y-6 animate-fade-in">
                  {banner.tagline && (
                    <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-purple-200 bg-black/40 sm:bg-white/10 backdrop-blur-md px-3 sm:px-3.5 py-1 rounded-full border border-white/20">
                      {banner.tagline}
                    </span>
                  )}
                  <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
                    {banner.title}
                  </h1>
                  <p className="text-xs sm:text-base md:text-lg text-gray-200 font-light leading-relaxed max-w-lg">
                    {banner.subtitle}
                  </p>
                  <div className="pt-1 sm:pt-2 flex flex-wrap gap-2.5 sm:gap-3">
                    <Link
                      to={banner.buttonLink || '/shop'}
                      className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-brand-primary hover:bg-brand-surface font-semibold text-xs sm:text-sm rounded-full shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5"
                    >
                      <span>{banner.buttonText || 'Shop Collection'}</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link
                      to="/shop"
                      className="inline-flex items-center space-x-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-semibold text-xs sm:text-sm rounded-full border border-white/30 transition duration-300"
                    >
                      <span>View Both Lotions</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Slideshow Controls (Bullets & Arrows) */}
        {banners.length > 1 && (
          <>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    i === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlide(prev => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm items-center justify-center transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % banners.length)}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm items-center justify-center transition"
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </section>

      {/* 2. VALUE PROPOSITIONS / ICON BOXES */}
      <section className="py-12 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-primary">
              Why You’ll Love {settings.brandName || 'SmoothSelf'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-xl mx-auto">
              Specially formulated for everyday luxury — high potency botanical moisture with a featherlight touch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#faf9f8] hover:bg-brand-surface border border-brand-border/40 transition duration-300">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-4 shadow-sm">
                <Sparkles size={26} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-primary mb-1.5">
                Instant Radiance & Glow
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Strawberry extracts boost skin luminosity while pure Vitamin E smooths dull and dry texture.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#faf9f8] hover:bg-brand-surface border border-brand-border/40 transition duration-300">
              <div className="w-14 h-14 rounded-full bg-purple-100 text-brand-primary flex items-center justify-center mb-4 shadow-sm">
                <Droplets size={26} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-primary mb-1.5">
                Up to 24-Hour Moisture
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Nourishing Madagascar Vanilla & sweet almond lipids seal in hydration from morning shower to night.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#faf9f8] hover:bg-brand-surface border border-brand-border/40 transition duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 shadow-sm">
                <Wind size={26} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-primary mb-1.5">
                Non-Greasy & Fast Absorbing
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Absorbs in seconds without sticky residue. Put on your clothes immediately without staining.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#faf9f8] hover:bg-brand-surface border border-brand-border/40 transition duration-300">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-sm">
                <RotateCcw size={26} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-primary mb-1.5">
                30-Day Hassle-Free Returns
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Return or exchange your order within 30 days of delivery. Shop with complete confidence and peace of mind on every order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE DUAL LOTION SHOWCASE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted block mb-2">
              Our Exclusive Formulations • 200ml Bottles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
              Two Everyday Luxury Lotions
            </h2>
            <p className="text-sm text-brand-muted mt-3">
              Crafted with clean actives, nourishing botanical lipids, and irresistible long-lasting fragrances. ₹249 each (MRP ₹299).
            </p>
          </div>

          {/* 2-Column Luxury Product Presentation */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="animate-pulse bg-[#faf9f8] aspect-[4/5] rounded-2xl"></div>
              <div className="animate-pulse bg-[#faf9f8] aspect-[4/5] rounded-2xl"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-[#faf9f8] rounded-2xl border border-brand-border/70 hover:border-brand-primary hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Photo Frame (Properly contained, no cropping) */}
                  <Link
                    to={`/product/${product.slug}`}
                    className="relative aspect-square sm:aspect-[4/3] bg-white border-b border-brand-border/60 flex items-center justify-center p-6 overflow-hidden"
                  >
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                      {product.badges?.map((badge, idx) => (
                        <span key={idx} className="bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {badge}
                        </span>
                      ))}
                      <span className="bg-brand-sale text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        17% OFF
                      </span>
                    </div>

                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 select-none"
                    />
                  </Link>

                  {/* Product Details & Actions */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                        <span className="text-brand-muted text-[11px] ml-1.5 font-medium">
                          ({product.numReviews || 25} reviews)
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-primary mb-2">
                        <Link to={`/product/${product.slug}`} className="hover:text-brand-hover">
                          {product.name}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-4">
                        {product.shortDescription}
                      </p>

                      {/* Benefits bullets */}
                      <ul className="space-y-1.5 mb-6 text-xs text-brand-text">
                        {product.benefits?.slice(0, 3).map((b, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                            <span><strong>{b.title}</strong></span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      {/* Price Tag */}
                      <div className="flex items-baseline space-x-3 mb-4 pb-4 border-b border-brand-border/60">
                        <span className="text-2xl sm:text-3xl font-bold text-brand-primary font-serif">
                          ₹{product.price}
                        </span>
                        <span className="text-sm text-brand-muted line-through">
                          MRP ₹{product.compareAtPrice}
                        </span>
                        <span className="text-xs font-bold text-brand-sale bg-rose-50 px-2 py-0.5 rounded">
                          Tax Included
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            addToCart(product, 1);
                            setIsCartOpen(true);
                          }}
                          className="w-full py-3 bg-white border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <ShoppingBag size={16} />
                          <span>Add to Bag</span>
                        </button>
                        <Link
                          to={`/product/${product.slug}`}
                          className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-1 shadow-md hover:shadow-lg"
                        >
                          <span>Buy Now</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. CHOOSE YOUR SENSATION (DUAL COMPARISON SPOTLIGHT) */}
      <section className="py-16 md:py-24 bg-[#faf9f8] border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted block mb-2">
              Find Your Match
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary">
              Choose Your Signature Sensation
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">
              Whether you crave juicy berry radiance or comforting warm vanilla hydration, your skin is in for a treat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Spotlight 1: Strawberry */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-block bg-rose-100 text-rose-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  🍓 Radiance & Glow
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-primary mb-2">
                  Strawberry & Vitamin E
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6">
                  Infused with pure natural strawberry fruit extracts that actively brighten, even out dull texture, and leave your skin sparkling with a crisp, sweet berry aura.
                </p>

                <div className="space-y-3 mb-6 bg-[#faf9f8] p-4 rounded-xl text-xs">
                  <div className="flex justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-brand-muted font-medium">Fragrance</span>
                    <span className="font-bold text-brand-primary">Fruity Fresh Strawberry</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-brand-muted font-medium">Key Active</span>
                    <span className="font-bold text-brand-primary">Strawberry Extract + Vitamin E</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-brand-muted font-medium">Skin Goal</span>
                    <span className="font-bold text-brand-primary">Instant Radiance & Brightness</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted font-medium">Texture</span>
                    <span className="font-bold text-brand-primary">Featherlight & Non-Greasy</span>
                  </div>
                </div>
              </div>

              <Link
                to="/product/strawberry-lotion"
                className="w-full py-3 text-center bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-xl transition duration-200 block shadow-sm"
              >
                Discover Strawberry Lotion — ₹249
              </Link>
            </div>

            {/* Spotlight 2: Vanilla */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-block bg-purple-100 text-brand-primary text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  🍦 Calming Hydration
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-primary mb-2">
                  Vanilla & Vitamin E
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6">
                  Rich in Madagascar vanilla bean extract and plant squalane to deeply soothe dry skin, relax the senses with warm gourmand vanilla, and lock in moisture for 24 hours.
                </p>

                <div className="space-y-3 mb-6 bg-[#faf9f8] p-4 rounded-xl text-xs">
                  <div className="flex justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-brand-muted font-medium">Fragrance</span>
                    <span className="font-bold text-brand-primary">Warm Calming Vanilla</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-brand-muted font-medium">Key Active</span>
                    <span className="font-bold text-brand-primary">Vanilla Pod + Vitamin E</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/60 pb-2">
                    <span className="text-brand-muted font-medium">Skin Goal</span>
                    <span className="font-bold text-brand-primary">Deep Moisture & Silky Touch</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted font-medium">Texture</span>
                    <span className="font-bold text-brand-primary">Silky Fast Absorbing</span>
                  </div>
                </div>
              </div>

              <Link
                to="/product/vanilla-body-lotion"
                className="w-full py-3 text-center bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-xl transition duration-200 block shadow-sm"
              >
                Discover Vanilla Lotion — ₹249
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL BOTANICAL FEATURE SECTION */}
      <section className="relative py-20 bg-brand-surface overflow-hidden border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-border group">
                <img
                  src={editorialDuoImg}
                  alt="SmoothSelf Pure Botanical Formulation & Texture"
                  className="w-full h-[360px] sm:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted bg-brand-primary/5 px-3.5 py-1.5 rounded-full border border-brand-primary/10">
                Botanical Alchemy & Purity
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary leading-tight">
                Crafted for Touch, Formulated for Barrier Health
              </h2>
              <p className="text-sm text-brand-muted leading-relaxed">
                Every drop of SmoothSelf lotion is enriched with cold-pressed botanical oils, active Vitamin E, and clean fruit essences. Designed to absorb deeply in seconds without greasiness, leaving skin velvety, fragrant, and radiant all day.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
                  <p className="font-serif text-2xl font-bold text-brand-primary">24h</p>
                  <p className="text-xs text-brand-muted mt-1">Barrier Moisture Lock</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
                  <p className="font-serif text-2xl font-bold text-brand-primary">100%</p>
                  <p className="text-xs text-brand-muted mt-1">Clean & Vegan Actives</p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center space-x-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition duration-200"
                >
                  <span>Explore Both Formulations</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted block mb-1">
              Real Experiences • Verified Buyers
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary">
              What Customers Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#faf9f8] border border-brand-border flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <h4 className="font-serif text-base font-bold text-brand-primary mb-2">
                  "Strawberry scent smells fresh & divine!"
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed italic">
                  "The strawberry lotion absorbs in seconds and leaves such a radiant dewy glow. It is not overly sweet, just very fresh and delicious. My arms feel silky smooth all day."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-primary">Priya Sharma</p>
                  <p className="text-[10px] text-brand-muted">Strawberry Lotion Buyer</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle size={10} />
                  <span>Verified Buyer</span>
                </span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#faf9f8] border border-brand-border flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <h4 className="font-serif text-base font-bold text-brand-primary mb-2">
                  "Vanilla lotion is super calming & non-greasy"
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed italic">
                  "Working in an AC room all day dries my skin out, but this vanilla lotion keeps me moisturized for over 12 hours. Zero stickiness and the soft vanilla aroma is so comforting."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-primary">Ananya Deshmukh</p>
                  <p className="text-[10px] text-brand-muted">Vanilla Lotion Buyer</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle size={10} />
                  <span>Verified Buyer</span>
                </span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#faf9f8] border border-brand-border flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <h4 className="font-serif text-base font-bold text-brand-primary mb-2">
                  "Ordered both! 30-day return gave confidence"
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed italic">
                  "I ordered both Strawberry and Vanilla together. The packaging was pristine, delivery arrived in 3 days, and knowing there was a 30-day return policy made it an easy choice!"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-primary">Sneha Patil</p>
                  <p className="text-[10px] text-brand-muted">SmoothSelf Duo Buyer</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle size={10} />
                  <span>Verified Buyer</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST GUILD / GUARANTEES BAR */}
      <section className="py-10 bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <Truck size={24} className="mx-auto text-purple-300 mb-2" />
              <p className="text-xs sm:text-sm font-semibold">Free Express Shipping</p>
              <p className="text-[11px] text-gray-300">On all orders above ₹450</p>
            </div>
            <div className="space-y-1">
              <RotateCcw size={24} className="mx-auto text-purple-300 mb-2" />
              <p className="text-xs sm:text-sm font-semibold">30-Day Hassle-Free Returns</p>
              <p className="text-[11px] text-gray-300">Within 30 days of delivery</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck size={24} className="mx-auto text-purple-300 mb-2" />
              <p className="text-xs sm:text-sm font-semibold">100% Clean & Vegan</p>
              <p className="text-[11px] text-gray-300">Dermatologist Tested</p>
            </div>
            <div className="space-y-1">
              <Clock size={24} className="mx-auto text-purple-300 mb-2" />
              <p className="text-xs sm:text-sm font-semibold">Cash on Delivery</p>
              <p className="text-[11px] text-gray-300">Available across all pin codes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
