import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';
import './ProductList.css';

export default function ProductList({ products, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="product-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="product-card skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-info">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-products-state">
        <PackageOpen size={48} className="empty-icon" />
        <h3>No Products Found</h3>
        <p>{emptyMessage || 'Try adjusting your search or filter options.'}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
