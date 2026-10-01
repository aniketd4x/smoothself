import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, X, ArrowRight } from 'lucide-react';

const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/products?search=${encodeURIComponent(searchTerm.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setResults(data.products.slice(0, 6));
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isSearchOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      ></div>

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-20 z-10">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in border border-brand-border">
          {/* Search Header */}
          <div className="p-4 sm:p-6 border-b border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-primary">Search our store</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-brand-muted hover:text-brand-primary p-1 rounded-full"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vanilla lotion, body butter, scrub, glow oils..."
                className="w-full pl-11 pr-24 py-3 bg-brand-surface border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary transition"
              />
              <Search size={19} className="absolute left-3.5 text-brand-muted" />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-md transition"
              >
                Search
              </button>
            </form>

            {/* Popular quick search tags */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto text-xs text-brand-muted">
              <span className="font-semibold text-brand-text">Popular:</span>
              {['Vanilla Lotion', 'Strawberry Souffle', 'Honey Butter', 'Coffee Scrub', 'Body Oil'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchTerm(tag)}
                  className="px-2.5 py-1 bg-brand-surface hover:bg-brand-border/60 rounded-full border border-brand-border text-brand-text transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-brand-muted">Searching formulations...</div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                  Products ({results.length})
                </p>
                {results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-surface transition group"
                  >
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'}
                      alt=""
                      className="w-12 h-14 object-cover rounded bg-white border border-brand-border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-brand-text group-hover:text-brand-primary truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-brand-muted">{product.categoryName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-brand-primary">₹{product.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="py-8 text-center text-xs text-brand-muted">
                No formulations matching "{searchTerm}". Try another keyword or browse all products.
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-brand-muted">
                Start typing to discover our restorative botanical skincare.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
