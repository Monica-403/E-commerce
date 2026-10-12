import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Check, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  IndianRupee, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { formatPrice } from '../utils/currency';
import './Admin.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Form state for Add/Edit product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    color: '',
    size: 'S, M, L',
    category: 'Basics',
    department: 'Women',
    quantity: '15',
  });

  // Inline Quick Stock Editing
  const [stockEditingId, setStockEditingId] = useState(null);
  const [quickStockVal, setQuickStockVal] = useState('');

  // Expanded order ID
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);

  // Always fetch BOTH products and orders on mount so statistics stay synced!
  useEffect(() => {
    fetchData();
    fetchDbStatus();
  }, []);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch both products and orders in parallel so counts, stock and revenue stay synced!
      const [prodsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);

      if (!prodsRes.ok) throw new Error('Failed to load products');
      if (!ordersRes.ok) throw new Error('Failed to load orders');

      const prodsData = await prodsRes.json();
      const ordersData = await ordersRes.json();

      setProducts(prodsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setErrorMsg(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      image: '',
      color: '',
      size: 'S, M, L',
      category: 'Basics',
      department: 'Women',
      quantity: '15',
    });
    setShowProductModal(true);
  };

  // Open Edit modal
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      image: p.image || '',
      color: p.color || '',
      size: p.size || 'S, M, L',
      category: p.category,
      department: p.department,
      quantity: p.quantity,
    });
    setShowProductModal(true);
  };

  // Handle Add/Edit form submission
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Operation failed');
      }

      setShowProductModal(false);
      showNotification(editingProduct ? 'Product updated successfully!' : 'New product added to catalog!');
      fetchData();
    } catch (err) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      showNotification('Product removed from catalog');
      fetchData();
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // Quick Stock Update
  const handleQuickStockSave = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(quickStockVal) }),
      });
      if (!res.ok) throw new Error('Failed to update stock');
      setStockEditingId(null);
      showNotification('Inventory stock updated!');
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showNotification(`Order #FC-${String(orderId).padStart(5, '0')} marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filtered lists based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.phone?.includes(searchTerm) ||
    String(o.id).includes(searchTerm) ||
    `#FC-${String(o.id).padStart(5, '0')}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const lowStockCount = products.filter(p => p.quantity <= 5).length;

  return (
    <div className="admin-page container">
      {/* Top Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <span className="section-eyebrow">Store Admin</span>
          <h1 className="admin-page-title">Management Dashboard</h1>
          <div className="admin-status-wrap">
            <span className="status-indicator-dot"></span>
            <span className="status-indicator-text">
              {dbStatus?.connectedToMySQL ? 'Connected to MySQL' : 'Local Mode'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-segmented-tabs">
          <button
            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
            className={`admin-seg-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            <Package size={17} />
            <span>Products</span>
            <span className="tab-counter-badge">{products.length}</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
            className={`admin-seg-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingBag size={17} />
            <span>Orders</span>
            <span className="tab-counter-badge highlight">{orders.length}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="admin-alert success animate-fade-in">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="admin-alert error animate-fade-in">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Clean Stat Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap products">
            <Package size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Products</span>
            <h3 className="stat-value">{products.length}</h3>
            <span className="stat-hint">Active in catalog</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap orders">
            <ShoppingBag size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Customer Orders</span>
            <h3 className="stat-value">{orders.length}</h3>
            <span className="stat-hint">Recorded purchases</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap revenue">
            <IndianRupee size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Revenue</span>
            <h3 className="stat-value">{formatPrice(totalRevenue)}</h3>
            <span className="stat-hint">Gross order volume</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap warning">
            <AlertCircle size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Low Stock Items</span>
            <h3 className="stat-value">{lowStockCount}</h3>
            <span className="stat-hint">&le; 5 units remaining</span>
          </div>
        </div>
      </div>

      {/* ==========================================================
          TAB 1: PRODUCTS INVENTORY
          ========================================================== */}
      {activeTab === 'products' && (
        <div className="admin-panel-card">
          {/* Action Toolbar */}
          <div className="panel-toolbar">
            <div className="panel-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search products by title, department, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="panel-actions">
              <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh data">
                <RefreshCw size={15} /> Refresh
              </button>
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Moderate Products Table */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Product</th>
                  <th>Department</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Color / Size</th>
                  <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.quantity <= 5 && p.quantity > 0;
                  const isOut = p.quantity <= 0;

                  return (
                    <tr key={p.id}>
                      <td className="text-muted font-mono">#{p.id}</td>
                      <td>
                        <div className="product-table-cell">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="product-table-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="product-table-name">{p.name}</div>
                            <small className="product-table-cat">{p.category}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dept-badge">{p.department}</span>
                      </td>
                      <td>
                        <strong className="price-tag">{formatPrice(p.price)}</strong>
                      </td>
                      <td>
                        {stockEditingId === p.id ? (
                          <div className="stock-inline-form">
                            <input
                              type="number"
                              min="0"
                              value={quickStockVal}
                              onChange={(e) => setQuickStockVal(e.target.value)}
                              className="stock-input"
                              autoFocus
                            />
                            <button onClick={() => handleQuickStockSave(p.id)} className="btn-stock-save" title="Save">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setStockEditingId(null)} className="btn-stock-cancel" title="Cancel">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`stock-badge-pill ${isOut ? 'out' : isLow ? 'low' : 'ok'}`}
                            onClick={() => { setStockEditingId(p.id); setQuickStockVal(p.quantity); }}
                            title="Click to edit stock"
                          >
                            <span>{p.quantity} units</span>
                            <Edit2 size={12} className="edit-hint-icon" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="variant-summary">
                          <span>{p.color}</span>
                          <small className="text-muted">{p.size}</small>
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn-icon edit"
                            title="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="btn-icon delete"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-table-message">
                      No products match your search. Try resetting the filter or click "Add Product".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: CUSTOMER ORDERS
          ========================================================== */}
      {activeTab === 'orders' && (
        <div className="admin-panel-card">
          {/* Toolbar */}
          <div className="panel-toolbar">
            <div className="panel-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search orders by customer name, phone, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="panel-actions">
              <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh orders">
                <RefreshCw size={15} /> Refresh Orders
              </button>
            </div>
          </div>

          {/* Moderate Orders Table */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Order Ref</th>
                  <th>Customer</th>
                  <th>Delivery Address</th>
                  <th>Total Amount</th>
                  <th>Date & Time</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Purchased Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className={isExpanded ? 'order-row-expanded' : ''}>
                        <td>
                          <span className="order-id-badge">
                            #FC-{String(order.id).padStart(5, '0')}
                          </span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <strong>{order.customer_name}</strong>
                            <span className="customer-sub">{order.phone}</span>
                            <small className="customer-sub text-muted">{order.email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="address-box" title={order.address}>
                            {order.address}
                          </div>
                        </td>
                        <td>
                          <strong className="order-total-price">
                            {formatPrice(order.total)}
                          </strong>
                        </td>
                        <td>
                          <div className="date-time-cell">
                            <span>{new Date(order.order_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <small className="text-muted">{new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                          </div>
                        </td>
                        <td>
                          <select
                            value={order.status || 'Confirmed'}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`status-select ${String(order.status || 'Confirmed').toLowerCase()}`}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="btn-toggle-items"
                          >
                            {order.items?.length || 0} items
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Items Row */}
                      {isExpanded && (
                        <tr className="order-expanded-details-row">
                          <td colSpan="7">
                            <div className="expanded-order-box">
                              <h4 className="expanded-box-title">
                                Order #FC-{String(order.id).padStart(5, '0')} Breakdown:
                              </h4>
                              <div className="expanded-items-grid">
                                {order.items && order.items.map((item, idx) => (
                                  <div key={idx} className="item-breakdown-card">
                                    <img
                                      src={item.product_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'}
                                      alt={item.product_name}
                                      className="item-breakdown-thumb"
                                    />
                                    <div className="item-breakdown-info">
                                      <strong>{item.product_name}</strong>
                                      <p className="item-breakdown-meta">
                                        Qty: {item.quantity} &times; {formatPrice(item.price)}
                                      </p>
                                      <span className="item-breakdown-total">
                                        Subtotal: {formatPrice(parseFloat(item.price) * item.quantity)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-table-message">
                      {searchTerm ? 'No orders match your search term.' : 'No customer orders have been placed yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          ADD / EDIT PRODUCT MODAL
          ========================================================== */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog animate-fade-in">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="modal-close-btn" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Classic Tailored Blazer"
                />
              </div>

              <div className="modal-row-2">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={productForm.department}
                    onChange={(e) => {
                      const dept = e.target.value;
                      let defaultCat = 'Basics';
                      if (dept === 'Men') defaultCat = 'Knitwear';
                      if (dept === 'Kids') defaultCat = 'Girl';
                      setProductForm({ ...productForm, department: dept, category: defaultCat });
                    }}
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {productForm.department === 'Women' && (
                      <>
                        <option value="Basics">Basics</option>
                        <option value="Blazer">Blazer</option>
                      </>
                    )}
                    {productForm.department === 'Men' && (
                      <>
                        <option value="Knitwear">Knitwear</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Jackets">Jackets</option>
                      </>
                    )}
                    {productForm.department === 'Kids' && (
                      <>
                        <option value="Girl">Girl</option>
                        <option value="Boy">Boy</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-row-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="999"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    placeholder="e.g. Camel, Black, Olive"
                  />
                </div>

                <div className="form-group">
                  <label>Available Sizes</label>
                  <input
                    type="text"
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    placeholder="e.g. S, M, L, XL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe fabric, fit, and styling..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
