const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ==========================================================
// 1. HEALTH / STATUS ENDPOINT
// ==========================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fashion Cube Backend API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db-status', (req, res) => {
  res.json({
    connectedToMySQL: db.isUsingMySQL(),
    databaseName: process.env.DB_NAME || 'fashion_cube',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    message: db.isUsingMySQL() 
      ? 'Active connection to MySQL database' 
      : 'Using local store. To connect to MySQL, verify DB_PASSWORD in backend/.env'
  });
});

// ==========================================================
// 2. CATEGORIES ENDPOINTS
// ==========================================================
// GET /api/categories - Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY department, name');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to retrieve categories', details: err.message });
  }
});

// ==========================================================
// 3. PRODUCTS ENDPOINTS
// ==========================================================
// GET /api/products - Get products with optional search and filters
app.get('/api/products', async (req, res) => {
  try {
    const { department, category, search, minPrice, maxPrice, sort } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (department && department !== 'All') {
      sql += ' AND LOWER(department) = LOWER(?)';
      params.push(department);
    }

    if (category && category !== 'All') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    if (sort === 'price-low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      sql += ' ORDER BY price DESC';
    } else {
      sql += ' ORDER BY id DESC';
    }

    const products = await db.query(sql, params);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

// GET /api/products/:id - Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ error: 'Failed to retrieve product details', details: err.message });
  }
});

// POST /api/products - Add a new product (Admin)
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image, color, size, category, department, quantity } = req.body;

    if (!name || !price || !category || !department) {
      return res.status(400).json({ error: 'Please provide name, price, category, and department' });
    }

    const fallbackImage = image && image.trim() !== '' 
      ? image 
      : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';

    const sql = `
      INSERT INTO products (name, description, price, image, color, size, category, department, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      name,
      description || '',
      parseFloat(price),
      fallbackImage,
      color || 'Standard',
      size || 'One Size',
      category,
      department,
      parseInt(quantity || 10, 10)
    ];

    const result = await db.query(sql, params);
    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// PUT /api/products/:id - Edit an existing product (Admin)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, color, size, category, department, quantity } = req.body;

    const sql = `
      UPDATE products
      SET name = ?, description = ?, price = ?, image = ?, color = ?, size = ?, category = ?, department = ?, quantity = ?
      WHERE id = ?
    `;
    const params = [
      name,
      description,
      parseFloat(price),
      image,
      color,
      size,
      category,
      department,
      parseInt(quantity, 10),
      id
    ];

    const result = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// PATCH /api/products/:id/stock - Quick stock update (Admin)
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ error: 'Valid quantity number is required' });
    }

    const result = await db.query('UPDATE products SET quantity = ? WHERE id = ?', [parseInt(quantity, 10), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Stock updated successfully', quantity: parseInt(quantity, 10) });
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ error: 'Failed to update stock', details: err.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// ==========================================================
// 4. ORDERS ENDPOINTS
// ==========================================================
// POST /api/orders - Place a new customer order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, email, phone, address, items, total } = req.body;

    if (!customer_name || !email || !phone || !address || !items || !items.length) {
      return res.status(400).json({ error: 'Please provide all customer details and at least one order item.' });
    }

    // 1. Calculate or use supplied total
    const computedTotal = total || items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity, 10)), 0);

    // 2. Insert into orders table
    const orderSql = `
      INSERT INTO orders (customer_name, email, phone, address, total, status)
      VALUES (?, ?, ?, ?, ?, 'Confirmed')
    `;
    const orderResult = await db.query(orderSql, [
      customer_name,
      email,
      phone,
      address,
      parseFloat(computedTotal).toFixed(2)
    ]);

    const orderId = orderResult.insertId;

    // 3. Insert each item into order_items and update product stock
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id || item.id, item.quantity, parseFloat(item.price)]
      );

      // Decrement stock quantity
      await db.query(
        'UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
        [item.quantity, item.product_id || item.id]
      );
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: orderId,
      total: parseFloat(computedTotal).toFixed(2)
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// GET /api/orders - Get all orders with their items (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    // Fetch orders
    const orders = await db.query('SELECT * FROM orders ORDER BY order_date DESC');

    // Fetch items for each order
    for (const order of orders) {
      const itemsSql = `
        SELECT oi.*, p.name AS product_name, p.image AS product_image, p.color AS product_color, p.size AS product_size
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      const items = await db.query(itemsSql, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to retrieve orders', details: err.message });
  }
});

// PUT /api/orders/:id/status - Update order status (Admin)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated successfully', status });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// ==========================================================
// START SERVER
// ==========================================================
async function startServer() {
  await db.initDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Fashion Cube Backend running at http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

startServer();
