'use strict'

const sqlite3 = require('sqlite3').verbose();

// Open database connection
const db = new sqlite3.Database('localdata.db', (err) => {
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
    stmt.run(name, price, function(err) {
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
  

// Export functions
module.exports = { fetchProducts, createProductTable, addProduct };
