'use strict'

const { app } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

// Use app.getPath('userData') to get a correct path for production
const dbPath = path.join(app.getPath('userData'), 'localdata.db')
console.log(dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err)
  }
})

// Create table if it doesn't exist
const createProductTable = () => {
  db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL)", (err) => {
    if (err) {
      console.error("Error creating table", err)
    }
  })
}

// Create 'transactions' table if it doesn't exist
const createTransactionTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      uniqid TEXT,
      transaction_date DATE,
      transaction_total REAL,
      payment_method INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
    if (err) {
      console.error("Error creating transactions table:", err)
    } else {
      console.log("Transactions table ready.")
    }
  })
}

// Create 'transaction_products' table if it doesn't exist
const createTransactionProductsTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transaction_products (
      id INTEGER PRIMARY KEY,
      transaction_id INTEGER,
      prod_id INTEGER,
      quantity INTEGER,
      unit_price REAL,
      discount REAL,
      extended_price REAL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    )`, (err) => {
    if (err) {
      console.error("Error creating transaction_products table:", err)
    } else {
      console.log("Transaction products table ready.")
    }
  })
}

// Fetch products from the database
const fetchProducts = (callback) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.error('Error fetching products', err)
      callback([])
    } else {
      callback(rows)
    }
  })
}

// Insert a new product into the database (Esto de momento no lo usaremos, no es necesario.)
const addProduct = (name, price, callback) => {
  const stmt = db.prepare("INSERT INTO products (name, price) VALUES (?, ?)")
  stmt.run(name, price, function (err) {
    if (err) {
      console.error('Error adding product', err)
      callback(false)
    } else {
      console.log('Product added with ID:', this.lastID)
      callback(true)
    }
  })
  stmt.finalize()
}

// By sync products insert them into the database
const syncProducts = (products) => {
  // Begin a transaction to ensure efficient batch insertion
  db.serialize(() => {
    // First, clear the existing products table
    db.run("DELETE FROM products", (err) => {
      if (err) {
        console.error('Error clearing products table:', err)
      }
    })

    // Insert each product from the API
    const stmt = db.prepare("INSERT INTO products (id, name, price) VALUES (?, ?, ?)")

    products.forEach((product) => {
      stmt.run(product.id, product.name, product.price, function (err) {
        if (err) {
          console.error('Error inserting product:', err)
        } else {
          console.log(`Product added with ID: ${this.lastID}`)
        }
      })
    })

    // Finalize the statement
    stmt.finalize()
  })
}

const createTransaction = (transaction) => {
  const { uniqid, transaction_date, transaction_total, payment_method, products } = transaction

  // Insert transaction into 'transactions' table
  db.run(`
    INSERT INTO transactions (uniqid, transaction_date, transaction_total, payment_method, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `, [uniqid, transaction_date, transaction_total, payment_method], function (err) {
    if (err) {
      console.error("Error creating transaction:", err)
      return
    }

    const transactionId = this.lastID

    // Insert each product into 'transaction_products' table
    const stmt = db.prepare(`
      INSERT INTO transaction_products (transaction_id, prod_id, quantity, unit_price, discount, extended_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    products.forEach((product) => {
      const { product_id, product_quantity, product_unit_price, product_discount, product_extended_price } = product
      stmt.run(transactionId, product_id, product_quantity, product_unit_price, product_discount, product_extended_price, (err) => {
        if (err) {
          console.error("Error adding product to transaction:", err)
        }
      })
    })

    stmt.finalize()
    console.log("Transaction and products added successfully.")
  })
}

// Fetch transactions from the database
const fetchTransactions = (callback) => {
  db.all("SELECT * FROM transactions", (err, rows) => {
    if (err) {
      console.error('Error fetching transactions', err)
      callback([])
    } else {
      callback(rows)
    }
  })
}

const fetchTransaction = (transactionId, callback) => {
  db.get("SELECT * FROM transactions WHERE id = ?", [transactionId], (err, transaction) => {
    if (err) {
      console.error('Error fetching transaction', err)
      callback(null)
    } else {
      // Fetch associated transaction products
      db.all("SELECT * FROM transaction_products WHERE transaction_id = ?", [transactionId], (err, products) => {
        if (err) {
          console.error('Error fetching transaction products', err)
          callback(null)
        } else {
          // Combine transaction data with its products
          callback({
            ...transaction,
            products: products // Add products array to transaction
          })
        }
      })
    }
  })
}

// Export functions
module.exports = { fetchProducts, createProductTable, createTransactionTable, createTransactionProductsTable, createTransaction, addProduct, syncProducts, fetchTransactions, fetchTransaction }
