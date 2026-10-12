import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductList from '../components/ProductList';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeTab === 'All'
    ? products
    : products.filter(p => p.department.toLowerCase() === activeTab.toLowerCase());

  const displayList = filteredProducts.slice(0, 8);

  const departments = [
    {
      name: 'Women',
      title: "Women's Collection",
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      link: '/shop?dept=Women',
    },
    {
      name: 'Men',
      title: "Men's Collection",
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80',
      link: '/shop?dept=Men',
    },
    {
      name: 'Kids',
      title: "Kids' Collection",
      image: 'https://images.unsplash.com/photo-1503944547408-b6559a442358?w=800&auto=format&fit=crop&q=80',
      link: '/shop?dept=Kids',
    },
  ];

  return (
    <div className="home-page">
      {/* 1. COMPACT HERO */}
      <section className="compact-hero">
        <div className="container compact-hero-inner">
          <div className="compact-hero-content">
            <span className="compact-hero-badge">NEW COLLECTION 2026</span>
            <h1 className="compact-hero-title">
              Modern Fashion, <br />Everyday Elegance
            </h1>
            <p className="compact-hero-sub">
              Explore curated apparel crafted for comfort, longevity, and timeless style.
            </p>
            <div className="compact-hero-actions">
              <Link to="/shop?dept=Women" className="btn btn-primary">
                Shop Women
              </Link>
              <Link to="/shop?dept=Men" className="btn btn-secondary">
                Shop Men
              </Link>
              <Link to="/shop?dept=Kids" className="btn btn-secondary">
                Shop Kids
              </Link>
            </div>
          </div>
          <div className="compact-hero-media">
            <img
              src="https://unsplash.com/photos/assorted-color-shirt-lot-hang-on-rack-xXJ6utyoSw0"
              alt="Fashion Cube Collection"
              className="compact-hero-img"
            />
          </div>
        </div>
      </section>

      {/* 2. THREE QUICK DEPARTMENT SHORTCUTS */}
      <section className="container dept-shortcuts-section">
        <div className="dept-shortcuts-grid">
          {departments.map((dept) => (
            <Link key={dept.name} to={dept.link} className="dept-shortcut-card">
              <img src={dept.image} alt={dept.title} className="dept-shortcut-img" />
              <div className="dept-shortcut-overlay"></div>
              <div className="dept-shortcut-info">
                <h3>{dept.title}</h3>
                <span className="dept-shortcut-link">
                  Shop Now <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. DIRECT CATALOG GRID WITH TABS */}
      <section className="container catalog-preview-section">
        <div className="catalog-preview-header">
          <div>
            <h2 className="catalog-preview-title">Featured Products</h2>
            <p className="catalog-preview-sub">Handpicked styles available for quick ordering</p>
          </div>

          <div className="catalog-dept-tabs">
            {['All', 'Women', 'Men', 'Kids'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`catalog-tab-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <ProductList
          products={displayList}
          loading={loading}
          emptyMessage="No products available in this department yet."
        />

        <div className="catalog-more-bar">
          <Link
            to={`/shop${activeTab !== 'All' ? `?dept=${activeTab}` : ''}`}
            className="btn btn-primary"
          >
            View All {activeTab !== 'All' ? `${activeTab}'s` : ''} Products <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
