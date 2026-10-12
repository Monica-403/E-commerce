import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import './Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal > 999 || subtotal === 0 ? 0.00 : 99.00;
  const estimatedTotal = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page container">
        <div className="empty-cart-view animate-fade-in">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={56} />
          </div>
          <h2 className="empty-cart-title">Your Shopping Bag is Empty</h2>
          <p className="empty-cart-subtitle">
            Looks like you haven't added anything to your cart yet. Explore our latest arrivals and timeless wardrobe staples.
          </p>
          <div className="empty-cart-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <div>
          <span className="section-eyebrow">Review Order</span>
          <h1 className="heading-section">Shopping Bag ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h1>
        </div>
        <button onClick={clearCart} className="clear-cart-link">
          Clear Entire Bag
        </button>
      </div>

      <div className="cart-layout">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="cart-item-row">
              <Link to={`/product/${item.id}`} className="cart-item-img-link">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </Link>

              <div className="cart-item-details">
                <div className="cart-item-header">
                  <span className="cart-item-dept">{item.department} • {item.category}</span>
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    className="item-remove-btn"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <Link to={`/product/${item.id}`} className="cart-item-name">
                  {item.name}
                </Link>

                <div className="cart-item-variants">
                  <span>Size: <strong>{item.selectedSize}</strong></span>
                  <span>•</span>
                  <span>Color: <strong>{item.selectedColor}</strong></span>
                </div>

                <div className="cart-item-footer">
                  <div className="cart-qty-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      className="qty-btn"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="qty-btn"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-price-col">
                    <span className="unit-price">{formatPrice(item.price)} each</span>
                    <span className="item-line-total">
                      {formatPrice(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="cart-continue-row">
            <Link to="/shop" className="continue-shopping-btn">
              <ArrowLeft size={16} /> Continue Browsing Collections
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <aside className="order-summary-card">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span className="summary-val">{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Standard Shipping</span>
            <span className="summary-val">
              {shipping === 0 ? <strong className="free-shipping-text">FREE</strong> : formatPrice(shipping)}
            </span>
          </div>

          {shipping > 0 && (
            <div className="free-shipping-progress">
              <small>Add {formatPrice(999 - subtotal)} more to qualify for <strong>FREE Shipping</strong></small>
            </div>
          )}

          <div className="summary-divider"></div>

          <div className="summary-total-row">
            <span>Estimated Total</span>
            <span className="total-val">{formatPrice(estimatedTotal)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-accent btn-lg checkout-btn"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div className="summary-guarantee">
            <ShieldCheck size={18} />
            <span>100% Secure & Encrypted Checkout</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
