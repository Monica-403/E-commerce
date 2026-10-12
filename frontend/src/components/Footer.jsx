import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Shield, RefreshCw, Truck } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      {/* Value Badges Strip */}
      <div className="footer-benefits-bar">
        <div className="container footer-benefits-grid">
          <div className="benefit-item">
            <Truck size={24} className="benefit-icon" />
            <div>
              <h4>Complimentary Shipping</h4>
              <p>On all orders across India above ₹999</p>
            </div>
          </div>
          <div className="benefit-item">
            <RefreshCw size={24} className="benefit-icon" />
            <div>
              <h4>30-Day Easy Returns</h4>
              <p>Hassle-free return policy</p>
            </div>
          </div>
          <div className="benefit-item">
            <Shield size={24} className="benefit-icon" />
            <div>
              <h4>Secure & Reliable</h4>
              <p>Trusted payment & data integrity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-main">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="cube-icon">FC</span>
              <span className="brand-name">FASHION<strong>CUBE</strong></span>
            </div>
            <p className="footer-desc">
              Your destination for modern, timeless fashion. Curated collections crafted for confidence, comfort, and everyday elegance.
            </p>
            <div className="brand-trust-badge">
              <span>✨ Premium Fashion Boutique</span>
              <small>Curated Collections • Fast Delivery Across India</small>
            </div>
          </div>

          {/* Shop Departments */}
          <div className="footer-col">
            <h4 className="footer-heading">Shop Departments</h4>
            <ul className="footer-links">
              <li><Link to="/shop?dept=Women">Women's Collection</Link></li>
              <li><Link to="/shop?dept=Women&cat=Basics">Women: Basics</Link></li>
              <li><Link to="/shop?dept=Women&cat=Blazer">Women: Blazers</Link></li>
              <li><Link to="/shop?dept=Men">Men's Collection</Link></li>
              <li><Link to="/shop?dept=Men&cat=Knitwear">Men: Knitwear</Link></li>
              <li><Link to="/shop?dept=Men&cat=Jeans">Men: Denim Jeans</Link></li>
              <li><Link to="/shop?dept=Kids">Kids' Collection</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Stay in Style</h4>
            <p className="newsletter-text">Subscribe to receive exclusive access to new seasonal drops and member-only promotions.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Fashion Cube!'); }} className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn btn-accent btn-sm">Join</button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} <strong>Fashion Cube</strong>. All rights reserved.</p>
          <div className="footer-tags">
            <span>100% Original Products</span>
            <span>•</span>
            <span>Fast Delivery</span>
            <span>•</span>
            <span>Easy 30-Day Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
