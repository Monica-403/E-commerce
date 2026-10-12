import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.quantity <= 0) return;

    const defaultSize = product.size ? product.size.split(',')[0].trim() : 'Standard';
    addToCart(product, defaultSize, product.color || 'Standard', 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {isOutOfStock && (
            <span className="product-status-pill out-of-stock">Sold Out</span>
          )}
        </div>

        <div className="product-info">
          <span className="product-dept-tag">
            {product.department} {product.category ? `· ${product.category}` : ''}
          </span>

          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>

          <div className="product-price-row">
            <span className="product-price">{formatPrice(product.price)}</span>
          </div>
        </div>
      </Link>

      <div className="product-card-actions">
        {isOutOfStock ? (
          <button className="btn-card-add disabled" disabled>
            Sold Out
          </button>
        ) : (
          <button
            onClick={handleQuickAdd}
            className={`btn-card-add ${added ? 'added' : ''}`}
          >
            {added ? (
              <>
                <Check size={15} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={15} /> Add to Bag
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

