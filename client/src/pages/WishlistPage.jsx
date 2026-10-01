import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
  const { wishlist } = useApp();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const matched = data.products.filter(p => wishlist.includes(p._id));
          setProducts(matched);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [wishlist]);

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary">
            My Wishlist ({products.length})
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-2">
            Formulations you have saved to try or replenish later.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-brand-surface aspect-product rounded-lg"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-brand-surface/40 rounded-2xl border border-brand-border">
            <Heart size={36} className="mx-auto text-brand-muted mb-3" />
            <h3 className="font-serif text-lg font-bold text-brand-primary">Your wishlist is empty</h3>
            <p className="text-xs text-brand-muted max-w-xs mx-auto mt-1 mb-6">
              Browse our handcrafted body care rituals and tap the heart icon to save your favorites.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-full shadow"
            >
              <span>Explore Formulations</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default WishlistPage;
