import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowLeft, ShieldCheck, Truck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const shipping = subtotal > 999 || subtotal === 0 ? 0.00 : 99.00;
  const grandTotal = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Your shopping bag is empty. Please add items before checking out.');
      return;
    }

    if (!formData.customer_name || !formData.email || !formData.phone || !formData.address) {
      setErrorMsg('Please complete all required customer shipping fields.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_name: formData.customer_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        total: grandTotal,
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order in database.');
      }

      // Order saved in MySQL successfully!
      setOrderConfirmed({
        orderId: data.orderId,
        customerName: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        total: grandTotal,
        items: [...cartItems],
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      // Clear cart
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred while saving your order to the database.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (orderConfirmed) {
    return (
      <div className="checkout-page container">
        <div className="order-success-card animate-fade-in">
          <div className="success-icon-wrap">
            <CheckCircle2 size={64} className="success-icon" />
          </div>

          <span className="success-badge">ORDER CONFIRMED</span>
          <h1 className="success-title">Thank You For Your Purchase!</h1>
          <p className="success-subtitle">
            Your order has been placed successfully! We've sent a confirmation receipt to <strong>{orderConfirmed.email}</strong>.
          </p>

          <div className="confirmation-details-box">
            <div className="confirm-row highlight">
              <span>Order Reference Number</span>
              <strong>#FC-{String(orderConfirmed.orderId).padStart(5, '0')}</strong>
            </div>
            <div className="confirm-row">
              <span>Customer Name</span>
              <span>{orderConfirmed.customerName}</span>
            </div>
            <div className="confirm-row">
              <span>Delivery Address</span>
              <span>{orderConfirmed.address}</span>
            </div>
            <div className="confirm-row">
              <span>Contact Phone</span>
              <span>{orderConfirmed.phone}</span>
            </div>
            <div className="confirm-row">
              <span>Order Date & Time</span>
              <span>{orderConfirmed.date}</span>
            </div>
            <div className="confirm-row highlight">
              <span>Total Amount</span>
              <strong>{formatPrice(orderConfirmed.total)}</strong>
            </div>
          </div>

          <div className="ordered-items-summary">
            <h3>Purchased Items ({orderConfirmed.items.length})</h3>
            <div className="ordered-items-list">
              {orderConfirmed.items.map((it, idx) => (
                <div key={idx} className="ordered-item-row">
                  <img src={it.image} alt={it.name} className="ordered-item-thumb" />
                  <div className="ordered-item-meta">
                    <h4>{it.name}</h4>
                    <small>Size: {it.selectedSize} | Color: {it.selectedColor} | Qty: {it.quantity}</small>
                  </div>
                  <span className="ordered-item-price">
                    {formatPrice(parseFloat(it.price) * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="success-actions">
            <Link to="/" className="btn btn-primary btn-lg">
              Return to Home
            </Link>
            <Link to="/shop" className="btn btn-outline btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page container text-center">
        <div className="empty-cart-view">
          <ShoppingBag size={56} className="text-muted" style={{ margin: '0 auto 16px' }} />
          <h2>No Items to Checkout</h2>
          <p>Please select fashion items and add them to your shopping bag before proceeding.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Browse Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-header">
        <Link to="/cart" className="back-to-cart-link">
          <ArrowLeft size={16} /> Return to Shopping Bag
        </Link>
        <h1 className="heading-section">Checkout</h1>
      </div>

      {errorMsg && (
        <div className="checkout-alert error">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="checkout-grid">
        {/* Left Column: Customer Shipping Form */}
        <div className="checkout-form-container">
          <form onSubmit={handleSubmitOrder} className="checkout-form">
            <div className="form-section-card">
              <h2 className="form-section-title">
                <Truck size={20} /> Shipping & Contact Information
              </h2>

              <div className="form-group">
                <label htmlFor="customer_name">Full Name *</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="e.g. jane.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Delivery Street Address *</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  required
                  placeholder="e.g. Apartment, Suite, Street name, City, State & Zip Code"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            <div className="form-section-card">
              <h2 className="form-section-title">
                <ShieldCheck size={20} /> Payment Option
              </h2>
              <div className="payment-simulation-box">
                <input type="radio" id="cod" name="paymentMethod" defaultChecked readOnly />
                <label htmlFor="cod">
                  <strong>Cash on Delivery (COD) / Pay on Delivery</strong>
                  <p>Pay with cash or UPI upon delivery. Safe and seamless order fulfillment.</p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-accent btn-lg place-order-btn"
            >
              {submitting ? 'Placing Order...' : `Place Order • ${formatPrice(grandTotal)}`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Review Summary */}
        <aside className="checkout-summary-card">
          <h2 className="summary-title">Order Items ({cartItems.length})</h2>

          <div className="checkout-items-list">
            {cartItems.map((item, idx) => (
              <div key={idx} className="checkout-item-row">
                <img src={item.image} alt={item.name} className="checkout-item-thumb" />
                <div className="checkout-item-info">
                  <h4 className="checkout-item-title">{item.name}</h4>
                  <div className="checkout-item-variants">
                    <span>Size: {item.selectedSize}</span> | <span>Color: {item.selectedColor}</span>
                  </div>
                  <span className="checkout-item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="checkout-item-price">
                  {formatPrice(parseFloat(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <strong className="free-shipping-text">FREE</strong> : formatPrice(shipping)}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total-row">
            <span>Total Payable</span>
            <span className="total-val">{formatPrice(grandTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
