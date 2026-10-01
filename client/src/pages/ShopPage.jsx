import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ChevronRight, X } from 'lucide-react';

import heroStrawberryImg from '../assets/hero_strawberry.jpg';
import heroVanillaImg from '../assets/hero_vanilla.jpg';

const FALLBACK_PRODUCTS = [
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
    category: { slug: 'lotions', name: 'Body Lotions' },
    shortDescription: 'Pure strawberry fruit extracts actively brighten, tone, and impart a juicy dewy glow.'
  },
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
    category: { slug: 'lotions', name: 'Body Lotions' },
    shortDescription: 'Deep 24-hour hydration infused with Madagascar Vanilla and Vitamin E for velvety soft skin.'
  }
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSort = searchParams.get('sort') || 'newest';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    setIsLoading(true);
    let url = `/api/products?sort=${selectedSort}`;
    if (selectedCategory && selectedCategory !== 'all') {
      url += `&category=${selectedCategory}`;
    }
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    Promise.all([
      fetch(url).then(r => r.json()).catch(() => null),
      fetch('/api/categories').then(r => r.json()).catch(() => null)
    ]).then(([prodData, catData]) => {
      if (prodData && prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
        setProducts(prodData.products);
      } else {
        let filtered = [...FALLBACK_PRODUCTS];
        if (searchTerm) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setProducts(filtered);
      }
      if (catData && catData.success && Array.isArray(catData.categories)) {
        setCategories(catData.categories);
      } else {
        setCategories([{ _id: 'cat-lotions', name: 'Body Lotions', slug: 'lotions' }]);
      }
    }).catch(() => {
      setProducts(FALLBACK_PRODUCTS);
    }).finally(() => setIsLoading(false));
  }, [selectedCategory, selectedSort, searchTerm]);

  const handleCategoryChange = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (sortVal) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', sortVal);
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="w-full bg-white py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center space-x-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={13} />
          <span className="text-brand-primary font-semibold">Shop Formulations</span>
        </nav>

        {/* HEADER TITLE */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Formulations'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-3">
            Handcrafted with cold-pressed natural botanicals, pure Madagascar vanilla, and clinical actives for velvety, hydrated skin.
          </p>
        </div>

        {/* FILTER & SORT BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-8 border-b border-brand-border gap-4">
          
          {/* CATEGORY CHIPS */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-surface text-brand-text hover:bg-brand-border/60'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => handleCategoryChange(c.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.slug
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-border/60'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* SORT DROPDOWN & ACTIVE FILTERS */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-brand-muted hidden sm:inline">
              Showing {products.length} formulations
            </span>

            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-xs text-brand-muted font-medium">Sort by:</label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 bg-brand-surface border border-brand-border rounded-lg text-xs font-medium text-brand-text focus:outline-none focus:border-brand-primary"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER TAGS */}
        {(selectedCategory !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <span className="text-xs font-semibold text-brand-text">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs text-brand-primary">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => handleCategoryChange('all')}><X size={13} /></button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs text-brand-primary">
                <span>Search: {searchTerm}</span>
                <button onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete('search');
                  setSearchParams(p);
                }}><X size={13} /></button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-brand-sale hover:underline ml-2 font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-brand-surface aspect-product rounded-lg"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-brand-surface/40 rounded-2xl border border-brand-border">
            <h3 className="font-serif text-xl font-bold text-brand-primary mb-2">
              No matching products found
            </h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mb-6">
              Try adjusting your category selection or searching for a different keyword.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-full"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopPage;
