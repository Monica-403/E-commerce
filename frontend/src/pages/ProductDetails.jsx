import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Check, ChevronRight, Truck, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import ProductList from '../components/ProductList';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);

      // Set default selected size
      if (data.size) {
        const sizes = data.size.split(',').map(s => s.trim());
        setSelectedSize(sizes[0] || 'Standard');
      }

      // Fetch related products
      fetchRelated(data.department, data.id);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (dept, currentId) => {
    try {
      const res = await fetch(`/api/products?department=${dept}`);
      if (res.ok) {
        const list = await res.json();
        setRelatedProducts(list.filter(p => p.id !== parseInt(currentId, 10)).slice(0, 4));
      }
    } catch (e) {
      console.error('Failed to load related products:', e);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.quantity <= 0) return;

    addToCart(product, selectedSize, product.color, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="product-details-page container">
        <div className="details-loading-skeleton">
          <div className="skeleton-img"></div>
          <div className="skeleton-text-block">
            <div className="skeleton-line large"></div>
            <div className="skeleton-line medium"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page container text-center not-found-state">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const availableSizes = product.size
    ? product.size.split(',').map(s => s.trim())
    : ['One Size'];

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="product-details-page container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to={`/shop?dept=${product.department}`}>{product.department}</Link>
        <ChevronRight size={14} />
        <Link to={`/shop?dept=${product.department}&cat=${product.category}`}>{product.category}</Link>
        <ChevronRight size={14} />
        <span className="current-crumb">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="details-grid">
        {/* Left: Product Image */}
        <div className="details-image-panel">
          <div className="large-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="large-product-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <span className="details-dept-badge">{product.department}</span>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="details-info-panel">
          <div className="details-header">
            <span className="details-category">{product.category}</span>
            <h1 className="details-title">{product.name}</h1>
            <div className="details-price-row">
              <span className="details-price">{formatPrice(product.price)}</span>
              <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                {isOutOfStock ? 'Out of Stock' : `${product.quantity} items available in stock`}
              </span>
            </div>
          </div>

          <p className="details-description">
            {product.description || 'Crafted with premium quality textiles for modern style and maximum comfort.'}
          </p>

          <div className="details-attributes">
            {/* Color Display */}
            <div className="attr-group">
              <label className="attr-label">Color:</label>
              <span className="color-value-badge">{product.color}</span>
            </div>

            {/* Size Selector */}
            <div className="attr-group">
              <label className="attr-label">Select Size:</label>
              <div className="size-selector-grid">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="attr-group">
                <label className="attr-label">Quantity:</label>
                <div className="quantity-controller">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="details-actions">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`btn btn-lg add-to-cart-btn ${isOutOfStock ? 'btn-disabled' : addedSuccess ? 'btn-success' : 'btn-primary'}`}
            >
              {addedSuccess ? (
                <>
                  <Check size={20} /> Added to Shopping Bag!
                </>
              ) : isOutOfStock ? (
                'Currently Out of Stock'
              ) : (
                <>
                  <ShoppingBag size={20} /> Add to Cart • {formatPrice(parseFloat(product.price) * quantity)}
                </>
              )}
            </button>

            <Link to="/cart" className="btn btn-outline btn-lg view-bag-btn">
              View Bag
            </Link>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="product-perks">
            <div className="perk-item">
              <Truck size={18} />
              <span>Complimentary shipping on all orders over ₹999</span>
            </div>
            <div className="perk-item">
              <RefreshCw size={18} />
              <span>30-Day Hassle-Free Exchange & Return Window</span>
            </div>
            <div className="perk-item">
              <ShieldCheck size={18} />
              <span>100% Guaranteed Authentic Fashion Cube apparel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Related Items */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Style Inspiration</span>
              <h2 className="heading-section">More from {product.department}</h2>
            </div>
            <Link to={`/shop?dept=${product.department}`} className="explore-all-link">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <ProductList products={relatedProducts} loading={false} />
        </section>
      )}
    </div>
  );
}
