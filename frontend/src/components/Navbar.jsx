import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="navbar-header">
      {/* Top Notification Bar */}
      <div className="top-banner">
        <span>Free standard delivery across India on orders above ₹999</span>
      </div>

      <nav className="navbar container">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="navbar-left">
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="brand-logo">
            <span className="cube-icon">FC</span>
            <span className="brand-name">FASHION<strong>CUBE</strong></span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          </li>
          <li className="dropdown-parent">
            <Link to="/shop?dept=Women" onClick={() => setMobileMenuOpen(false)}>
              Women <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            <div className="dropdown-menu">
              <Link to="/shop?dept=Women" onClick={() => setMobileMenuOpen(false)}>All Women</Link>
              <Link to="/shop?dept=Women&cat=Basics" onClick={() => setMobileMenuOpen(false)}>Basics</Link>
              <Link to="/shop?dept=Women&cat=Blazer" onClick={() => setMobileMenuOpen(false)}>Blazers</Link>
            </div>
          </li>
          <li className="dropdown-parent">
            <Link to="/shop?dept=Men" onClick={() => setMobileMenuOpen(false)}>
              Men <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            <div className="dropdown-menu">
              <Link to="/shop?dept=Men" onClick={() => setMobileMenuOpen(false)}>All Men</Link>
              <Link to="/shop?dept=Men&cat=Knitwear" onClick={() => setMobileMenuOpen(false)}>Knitwear</Link>
              <Link to="/shop?dept=Men&cat=Jeans" onClick={() => setMobileMenuOpen(false)}>Jeans</Link>
              <Link to="/shop?dept=Men&cat=Jackets" onClick={() => setMobileMenuOpen(false)}>Jackets</Link>
            </div>
          </li>
          <li className="dropdown-parent">
            <Link to="/shop?dept=Kids" onClick={() => setMobileMenuOpen(false)}>
              Kids <ChevronDown size={14} className="dropdown-arrow" />
            </Link>
            <div className="dropdown-menu">
              <Link to="/shop?dept=Kids" onClick={() => setMobileMenuOpen(false)}>All Kids</Link>
              <Link to="/shop?dept=Kids&cat=Girl" onClick={() => setMobileMenuOpen(false)}>Girls</Link>
              <Link to="/shop?dept=Kids&cat=Boy" onClick={() => setMobileMenuOpen(false)}>Boys</Link>
            </div>
          </li>
          <li>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>All Collections</Link>
          </li>
        </ul>

        {/* Right: Search, Cart, Admin */}
        <div className="navbar-actions">
          {/* Quick Search */}
          <div className={`search-container ${searchOpen ? 'open' : ''}`}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-submit-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </div>

          <button
            className="action-icon-btn mobile-search-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>

          {/* Cart Icon with badge */}
          <Link to="/cart" className="action-icon-btn cart-btn" aria-label="Shopping Cart">
            <ShoppingBag size={21} />
            {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
          </Link>

          {/* Admin link */}
          <Link to="/admin" className="admin-link-btn" title="Admin Portal">
            <ShieldCheck size={16} />
            <span className="admin-text">Admin</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
