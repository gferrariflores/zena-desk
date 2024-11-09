'use strict'

const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Use app.getPath('userData') to get a correct path for production
const dbPath = path.join(app.getPath('userData'), 'localdata.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  }
});

// Create table if it doesn't exist
const createProductTable = () => {
  db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL)", (err) => {
    if (err) {
      console.error("Error creating table", err);
    }
  });
};

// Fetch products from the database
const fetchProducts = (callback) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.error('Error fetching products', err);
      callback([]);
    } else {
      callback(rows);
    }
  });
};

// Insert a new product into the database
const addProduct = (name, price, callback) => {
  const stmt = db.prepare("INSERT INTO products (name, price) VALUES (?, ?)");
  stmt.run(name, price, function (err) {
    if (err) {
      console.error('Error adding product', err);
      callback(false);
    } else {
      console.log('Product added with ID:', this.lastID);
      callback(true);
    }
  });
  stmt.finalize();
};

// By sync products insert them into the database
const syncProducts = (products) => {
  // Begin a transaction to ensure efficient batch insertion
  db.serialize(() => {
    // First, clear the existing products table
    db.run("DELETE FROM products", (err) => {
      if (err) {
        console.error('Error clearing products table:', err);
      }
    });

    // Insert each product from the API
    const stmt = db.prepare("INSERT INTO products (id, name, price) VALUES (?, ?, ?)");

    products.forEach((product) => {
      stmt.run(product.id, product.name, product.price, function (err) {
        if (err) {
          console.error('Error inserting product:', err);
        } else {
          console.log(`Product added with ID: ${this.lastID}`);
        }
      });
    });

    // Finalize the statement
    stmt.finalize();
  });
};

// Export functions
module.exports = { fetchProducts, createProductTable, addProduct, syncProducts };
