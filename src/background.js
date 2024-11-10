'use strict'

const { app, protocol, BrowserWindow, ipcMain } = require('electron')
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib')
const installExtension = require('electron-devtools-installer').default
const VUEJS3_DEVTOOLS = require('electron-devtools-installer').VUEJS3_DEVTOOLS

// Import database functions
const { fetchProducts, createProductTable, createTransactionTable, createTransactionProductsTable, createTransaction, addProduct, syncProducts, fetchTransactions, fetchTransaction } = require('./database')

const isDevelopment = process.env.NODE_ENV !== 'production'

// Register app scheme
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// Create the window
async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// Fetch products on IPC event
ipcMain.on('fetch-products', (event) => {
  fetchProducts((rows) => {
    event.reply('products', rows)
  })
})

// Listen for the add-product IPC event
ipcMain.on('add-product', (event, product) => {
  const { name, price } = product
  addProduct(name, price, (success) => {
    event.reply('product-added', success)
  })
})

// Listen for the sync-products IPC event
ipcMain.on('sync-products', (event, products) => {
  syncProducts(products) // Sync the products to the local database
  event.reply('products-synced', true) // Send a reply back to the renderer process
})

// Listen for the create-transaction IPC event
ipcMain.on('create-transaction', (event, transaction) => {
  createTransaction(transaction)
  event.reply('transaction-created', true) // Send a reply back to the renderer process
})

// Fetch transactions on IPC event
ipcMain.on('fetch-transactions', (event) => {
  fetchTransactions((rows) => {
    event.reply('transactions', rows)
  })
})

// Fetch transaction on IPC event
ipcMain.on('fetch-transaction', (event, transactionId) => {
  fetchTransaction(transactionId, (transaction) => {
    event.reply('transaction', transaction)
  })
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  // Ensure the products, transactions, transaction_products table exists
  createProductTable()
  createTransactionTable()
  createTransactionProductsTable()

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
