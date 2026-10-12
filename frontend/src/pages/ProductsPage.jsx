import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import ProductList from '../components/ProductList';
import SearchBar from '../components/SearchBar';
import { formatPrice } from '../utils/currency';
import './ProductsPage.css';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const departmentParam = searchParams.get('dept') || 'All';
  const categoryParam = searchParams.get('cat') || 'All';
  const searchParam = searchParams.get('search') || '';

  // Local state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedDept, setSelectedDept] = useState(departmentParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Departments and categories mapping
  const departmentsData = {
    Women: ['Basics', 'Blazer'],
    Men: ['Knitwear', 'Jeans', 'Jackets'],
    Kids: ['Girl', 'Boy'],
  };

  // Sync state when URL searchParams changes
  useEffect(() => {
    setSelectedDept(searchParams.get('dept') || 'All');
    setSelectedCategory(searchParams.get('cat') || 'All');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch products from backend whenever filters change
  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedDept, selectedCategory, maxPrice, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedDept && selectedDept !== 'All') params.append('department', selectedDept);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setSelectedCategory('All'); // Reset category when department changes
    updateUrl(dept, 'All', searchTerm);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    updateUrl(selectedDept, cat, searchTerm);
  };

  const updateUrl = (dept, cat, search) => {
    const nextParams = new URLSearchParams();
    if (dept && dept !== 'All') nextParams.set('dept', dept);
    if (cat && cat !== 'All') nextParams.set('cat', cat);
    if (search && search.trim()) nextParams.set('search', search.trim());
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSelectedDept('All');
    setSelectedCategory('All');
    setSearchTerm('');
    setMaxPrice(5000);
    setSortBy('newest');
    setSearchParams({});
  };

  // Available categories based on selected department
  const availableCategories =
    selectedDept === 'All'
      ? ['Basics', 'Blazer', 'Knitwear', 'Jeans', 'Jackets', 'Girl', 'Boy']
      : departmentsData[selectedDept] || [];

  return (
    <div className="products-page container">
      {/* Page Header */}
      <div className="catalog-header">
        <div>
          <span className="section-eyebrow">
            {selectedDept !== 'All' ? `${selectedDept}'s Collection` : 'All Departments'}
          </span>
          <h1 className="heading-section">
            {selectedCategory !== 'All' ? `${selectedDept} • ${selectedCategory}` : selectedDept !== 'All' ? `${selectedDept}'s Fashion` : 'All Products'}
          </h1>
          <p className="catalog-subtitle">
            Showing {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Top Controls: Search & Sort */}
        <div className="catalog-top-controls">
          <div className="search-wrap">
            <SearchBar
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                updateUrl(selectedDept, selectedCategory, val);
              }}
              onClear={() => {
                setSearchTerm('');
                updateUrl(selectedDept, selectedCategory, '');
              }}
              placeholder="Search products by name..."
            />
          </div>

          <div className="sort-wrap">
            <label htmlFor="sort-select">Sort By:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <button
            className="mobile-filter-trigger btn btn-secondary btn-sm"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div className="catalog-layout">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${mobileFilterOpen ? 'mobile-drawer-open' : ''}`}>
          <div className="sidebar-header">
            <h3><Filter size={18} /> Filter Products</h3>
            <button
              className="close-drawer-btn"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Department Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Department</h4>
            <div className="filter-options">
              {['All', 'Women', 'Men', 'Kids'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => handleDeptSelect(dept)}
                  className={`filter-chip ${selectedDept === dept ? 'active' : ''}`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              <button
                onClick={() => handleCategorySelect('All')}
                className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
              >
                All Categories
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <div className="price-title-row">
              <h4 className="filter-title">Max Price</h4>
              <span className="price-display">{formatPrice(maxPrice, false)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-labels">
              <span>₹500</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Reset Filters */}
          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm reset-filters-btn">
            <RotateCcw size={14} /> Reset All Filters
          </button>
        </aside>

        {/* Products Grid Content */}
        <main className="catalog-content">
          {/* Active Filter Badges */}
          {(selectedDept !== 'All' || selectedCategory !== 'All' || searchTerm) && (
            <div className="active-filters-bar">
              <span className="active-label">Active:</span>
              {selectedDept !== 'All' && (
                <span className="active-tag">
                  Dept: {selectedDept}{' '}
                  <X size={12} onClick={() => handleDeptSelect('All')} />
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="active-tag">
                  Category: {selectedCategory}{' '}
                  <X size={12} onClick={() => handleCategorySelect('All')} />
                </span>
              )}
              {searchTerm && (
                <span className="active-tag">
                  Search: "{searchTerm}"{' '}
                  <X size={12} onClick={() => { setSearchTerm(''); updateUrl(selectedDept, selectedCategory, ''); }} />
                </span>
              )}
            </div>
          )}

          <ProductList
            products={products}
            loading={loading}
            emptyMessage="No fashion pieces match your current filter criteria."
          />
        </main>
      </div>
    </div>
  );
}
