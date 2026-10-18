const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isConnectedToMySQL = false;

// In-Memory fallback store for seamless demonstration if MySQL password needs configuration
let fallbackCategories = [
  { id: 1, name: 'Basics', department: 'Women' },
  { id: 2, name: 'Blazer', department: 'Women' },
  { id: 3, name: 'Knitwear', department: 'Men' },
  { id: 4, name: 'Jeans', department: 'Men' },
  { id: 5, name: 'Jackets', department: 'Men' },
  { id: 6, gname: 'Girl', name: 'Girl', department: 'Kids' },
  { id: 7, name: 'Boy', department: 'Kids' },
];

let fallbackProducts = [
  {
    id: 1,
    name: 'Basic Ribbed Top',
    description: 'Minimalist ribbed crewneck top made from ultra-soft stretch cotton for effortless everyday styling.',
    price: 799.00,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    color: 'White',
    size: 'S, M, L',
    category: 'Basics',
    department: 'Women',
    quantity: 35,
  },
  {
    id: 2,
    name: 'Essential Tank Top',
    description: 'Classic racerback ribbed tank crafted with breathable organic cotton. Perfect as a base layer.',
    price: 599.00,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    color: 'Black',
    size: 'XS, S, M, L',
    category: 'Basics',
    department: 'Women',
    quantity: 50,
  },
  {
    id: 3,
    name: 'Oversized Textured Top',
    description: 'Relaxed-fit waffle knit tunic top with dropped shoulders, raw-cut edges, and ribbed cuffs.',
    price: 1199.00,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80',
    color: 'Beige',
    size: 'S, M, L',
    category: 'Basics',
    department: 'Women',
    quantity: 28,
  },
  {
    id: 4,
    name: 'Belted Plaid Blazer',
    description: 'Tailored houndstooth plaid blazer featuring a notched lapel, front flap pockets, and an adjustable waist belt.',
    price: 2999.00,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
    color: 'Grey Plaid',
    size: 'S, M, L',
    category: 'Blazer',
    department: 'Women',
    quantity: 15,
  },
  {
    id: 5,
    name: 'Double-Breasted Blazer',
    description: 'Sharp double-breasted structured blazer cut from premium twill blend with padded shoulders.',
    price: 3499.00,
    image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
    color: 'Navy Blue',
    size: 'S, M, L, XL',
    category: 'Blazer',
    department: 'Women',
    quantity: 18,
  },
  {
    id: 6,
    name: 'Chunky Knit Sweater',
    description: 'Warm chunky crewneck sweater knitted from soft wool blend with ribbed cuffs and hem.',
    price: 1899.00,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    color: 'Forest Green',
    size: 'M, L, XL',
    category: 'Knitwear',
    department: 'Men',
    quantity: 30,
  },
  {
    id: 7,
    name: 'Classic Cable Knit Cardigan',
    description: 'Heritage cable knit cardigan with faux-horn buttons and a cozy shawl collar.',
    price: 2199.00,
    image: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&auto=format&fit=crop&q=80',
    color: 'Cream',
    size: 'S, M, L, XL',
    category: 'Knitwear',
    department: 'Men',
    quantity: 22,
  },
  {
    id: 8,
    name: 'Vintage Ripped Jeans',
    description: 'Vintage light wash slim straight denim jeans with subtle knee distressing and whiskering.',
    price: 1999.00,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
    color: 'Light Wash',
    size: '30, 32, 34, 36',
    category: 'Jeans',
    department: 'Men',
    quantity: 40,
  },
  {
    id: 9,
    name: 'Basic Slim Fit Jeans',
    description: 'Classic five-pocket dark indigo denim jeans with flexible comfort stretch and clean stitching.',
    price: 1699.00,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    color: 'Dark Indigo',
    size: '30, 32, 34, 36',
    category: 'Jeans',
    department: 'Men',
    quantity: 45,
  },
  {
    id: 10,
    name: 'Classic Leather Biker Jacket',
    description: 'Iconic asymmetrical biker jacket featuring silver hardware, zippered pockets, and smooth vegan leather.',
    price: 4499.00,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    color: 'Jet Black',
    size: 'S, M, L, XL',
    category: 'Jackets',
    department: 'Men',
    quantity: 14,
  },
  {
    id: 11,
    name: 'Utility Canvas Jacket',
    description: 'Rugged workwear-inspired field jacket with double chest flap pockets and snap buttons.',
    price: 2499.00,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    color: 'Olive Green',
    size: 'M, L, XL',
    category: 'Jackets',
    department: 'Men',
    quantity: 25,
  },
  {
    id: 12,
    name: 'Kids Cozy Fleece Sweatshirt',
    description: 'Super-soft brushed cotton fleece pullover with cheerful graphic lettering and elastic ribbing.',
    price: 999.00,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
    color: 'Pastel Pink',
    size: '4Y, 6Y, 8Y, 10Y',
    category: 'Girl',
    department: 'Kids',
    quantity: 32,
  },
  {
    id: 13,
    name: 'Kids Floral Skater Dress',
    description: 'Breezy everyday dress with vibrant floral botanical prints and flared tiered silhouette.',
    price: 1199.00,
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80',
    color: 'Floral Yellow',
    size: '3Y, 5Y, 7Y, 9Y',
    category: 'Girl',
    department: 'Kids',
    quantity: 20,
  },
  {
    id: 14,
    name: 'Kids Quilted Bomber Jacket',
    description: 'Insulated zip-up flight bomber jacket with contrast orange lining and snug ribbed collar.',
    price: 1499.00,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
    color: 'Navy Blue',
    size: '5Y, 7Y, 9Y, 11Y',
    category: 'Boy',
    department: 'Kids',
    quantity: 25,
  },
  {
    id: 15,
    name: 'Kids Sporty Colorblock Hoodie',
    description: 'Casual sporty hoodie featuring bold contrast colorblocking and roomy front pouch pocket.',
    price: 899.00,
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&auto=format&fit=crop&q=80',
    color: 'Teal & Grey',
    size: '4Y, 6Y, 8Y, 10Y',
    category: 'Boy',
    department: 'Kids',
    quantity: 35,
  },
];

let fallbackOrders = [
  {
    id: 1,
    customer_name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+91-98765-43210',
    address: '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
    total: 3798.00,
    order_date: new Date().toISOString(),
    status: 'Delivered',
    items: [
      { product_id: 1, product_name: 'Basic Ribbed Top', quantity: 1, price: 799.00 },
      { product_id: 4, product_name: 'Belted Plaid Blazer', quantity: 1, price: 2999.00 },
    ],
  },
];

async function initDatabase() {
  try {
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    const dbName = process.env.DB_NAME || 'fashion_cube';
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
    });

    // Test connection
    const [test] = await pool.query('SELECT 1');
    isConnectedToMySQL = true;

    console.log(`====================================================`);
    console.log(`[DB] Connected successfully to MySQL database "${dbName}"`);
    console.log(`[DB] Host: ${dbConfig.host}:${dbConfig.port} | User: ${dbConfig.user}`);
    console.log(`====================================================`);

    await createTablesIfNotExist();
    return true;
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn('----------------------------------------------------');
    console.warn('[DB NOTICE] MySQL connection pending credentials:');
    console.warn(`Error: ${err.message}`);
    console.warn(`HINT: Update DB_PASSWORD in "backend/.env" to your MySQL password.`);
    console.warn(`(Active fallback mode enabled so you can test the full UI and API right away!)`);
    console.warn('----------------------------------------------------');
    return false;
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(500) NOT NULL,
      color VARCHAR(100) NOT NULL,
      size VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      quantity INT NOT NULL DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'Processing'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // Seed categories
  const [catRows] = await pool.query('SELECT COUNT(*) AS count FROM categories');
  if (catRows[0].count === 0) {
    console.log('[DB] Seeding categories into MySQL...');
    await pool.query(`
      INSERT INTO categories (name, department) VALUES
      ('Basics', 'Women'),
      ('Blazer', 'Women'),
      ('Knitwear', 'Men'),
      ('Jeans', 'Men'),
      ('Jackets', 'Men'),
      ('Girl', 'Kids'),
      ('Boy', 'Kids');
    `);
  }

  // Seed sample products
  const [prodRows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  if (prodRows[0].count === 0) {
    console.log('[DB] Seeding sample products into MySQL...');
    for (const p of fallbackProducts) {
      await pool.query(`
        INSERT INTO products (name, description, price, image, color, size, category, department, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.name, p.description, p.price, p.image, p.color, p.size, p.category, p.department, p.quantity]);
    }
  }
}

// Simple query helper with automatic fallback handling
async function query(sql, params = []) {
  if (isConnectedToMySQL && pool) {
    const [results] = await pool.query(sql, params);
    return results;
  }

  // Fallback simulator if MySQL is disconnected
  return executeFallback(sql, params);
}

function executeFallback(sql, params) {
  const cleanSql = sql.trim().toUpperCase();

  // 1. SELECT categories
  if (cleanSql.startsWith('SELECT * FROM CATEGORIES')) {
    return fallbackCategories;
  }

  // 2. SELECT products
  if (cleanSql.startsWith('SELECT * FROM PRODUCTS WHERE 1=1')) {
    let result = [...fallbackProducts];

    // Simple filtering based on query params passed
    let paramIndex = 0;
    if (sql.includes('LOWER(department) = LOWER(?)')) {
      const dept = params[paramIndex++];
      result = result.filter(p => p.department.toLowerCase() === dept.toLowerCase());
    }
    if (sql.includes('LOWER(category) = LOWER(?)')) {
      const cat = params[paramIndex++];
      result = result.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }
    if (sql.includes('LIKE LOWER(?)')) {
      const searchRaw = params[paramIndex++]; // e.g. %query%
      paramIndex++; // second LIKE parameter
      const search = searchRaw.replace(/%/g, '').toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }
    if (sql.includes('price >= ?')) {
      const minP = params[paramIndex++];
      result = result.filter(p => p.price >= minP);
    }
    if (sql.includes('price <= ?')) {
      const maxP = params[paramIndex++];
      result = result.filter(p => p.price <= maxP);
    }

    if (sql.includes('ORDER BY price ASC')) {
      result.sort((a, b) => a.price - b.price);
    } else if (sql.includes('ORDER BY price DESC')) {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }

  // 3. SELECT single product by id
  if (cleanSql.startsWith('SELECT * FROM PRODUCTS WHERE ID = ?')) {
    const p = fallbackProducts.find(item => item.id === Number(params[0]));
    return p ? [p] : [];
  }

  // 4. INSERT INTO products
  if (cleanSql.startsWith('INSERT INTO PRODUCTS')) {
    const newId = fallbackProducts.length > 0 ? Math.max(...fallbackProducts.map(p => p.id)) + 1 : 1;
    const [name, description, price, image, color, size, category, department, quantity] = params;
    const newProd = {
      id: newId,
      name,
      description,
      price: Number(price),
      image,
      color,
      size,
      category,
      department,
      quantity: Number(quantity),
    };
    fallbackProducts.unshift(newProd);
    return { insertId: newId, affectedRows: 1 };
  }

  // 5. UPDATE products
  if (cleanSql.startsWith('UPDATE PRODUCTS SET NAME = ?')) {
    const [name, description, price, image, color, size, category, department, quantity, id] = params;
    const idx = fallbackProducts.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      fallbackProducts[idx] = {
        ...fallbackProducts[idx],
        name,
        description,
        price: Number(price),
        image,
        color,
        size,
        category,
        department,
        quantity: Number(quantity),
      };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 6. UPDATE products SET quantity = ? WHERE id = ?
  if (cleanSql.startsWith('UPDATE PRODUCTS SET QUANTITY = ? WHERE ID = ?')) {
    const [qty, id] = params;
    const p = fallbackProducts.find(item => item.id === Number(id));
    if (p) {
      p.quantity = Number(qty);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 7. DELETE FROM products
  if (cleanSql.startsWith('DELETE FROM PRODUCTS WHERE ID = ?')) {
    const id = Number(params[0]);
    const initLen = fallbackProducts.length;
    fallbackProducts = fallbackProducts.filter(p => p.id !== id);
    return { affectedRows: initLen - fallbackProducts.length };
  }

  // 8. INSERT INTO orders
  if (cleanSql.startsWith('INSERT INTO ORDERS')) {
    const [customer_name, email, phone, address, total] = params;
    const newOrderId = fallbackOrders.length > 0 ? Math.max(...fallbackOrders.map(o => o.id)) + 1 : 1;
    const newOrder = {
      id: newOrderId,
      customer_name,
      email,
      phone,
      address,
      total: Number(total),
      order_date: new Date().toISOString(),
      status: 'Confirmed',
      items: [],
    };
    fallbackOrders.unshift(newOrder);
    return { insertId: newOrderId, affectedRows: 1 };
  }

  // 9. INSERT INTO order_items
  if (cleanSql.startsWith('INSERT INTO ORDER_ITEMS')) {
    const [orderId, productId, qty, price] = params;
    const order = fallbackOrders.find(o => o.id === Number(orderId));
    if (order) {
      const prod = fallbackProducts.find(p => p.id === Number(productId));
      order.items.push({
        product_id: productId,
        product_name: prod ? prod.name : 'Fashion Item',
        quantity: qty,
        price,
      });
    }
    return { affectedRows: 1 };
  }

  // 10. UPDATE stock decrement
  if (cleanSql.startsWith('UPDATE PRODUCTS SET QUANTITY = GREATEST')) {
    const [decQty, prodId] = params;
    const p = fallbackProducts.find(item => item.id === Number(prodId));
    if (p) {
      p.quantity = Math.max(0, p.quantity - Number(decQty));
    }
    return { affectedRows: 1 };
  }

  // 10b. UPDATE order status
  if (cleanSql.startsWith('UPDATE ORDERS SET STATUS = ? WHERE ID = ?')) {
    const [status, id] = params;
    const o = fallbackOrders.find(item => item.id === Number(id));
    if (o) {
      o.status = status;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 11. SELECT orders
  if (cleanSql.startsWith('SELECT * FROM ORDERS')) {
    return fallbackOrders;
  }

  // 12. SELECT order_items
  if (cleanSql.includes('FROM ORDER_ITEMS OI') || cleanSql.includes('ORDER_ID = ?')) {
    const orderId = Number(params[0]);
    const order = fallbackOrders.find(o => o.id === orderId);
    return order ? order.items : [];
  }

  return [];
}

module.exports = {
  initDatabase,
  query,
  getPool: () => pool,
  isUsingMySQL: () => isConnectedToMySQL,
};
