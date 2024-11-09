<template>
  <div class="container my-3">
    <h1>Productos</h1>
    <button @click="addProduct" class="btn btn-primary mb-3 d-none">Agregar Producto</button>
    <button @click="syncProducts" class="btn btn-primary mb-3">Sincronizar Productos</button>

    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>${{ new Intl.NumberFormat("de-DE").format(product.price) }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>

import { ipcRenderer } from 'electron';

export default {
  name: 'ProductsView',
  data() {
    return {
      products: []
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    addProduct() {
      const newProduct = {
        name: 'New Product',
        price: 9.99
      };

      // Send the new product data through IPC
      ipcRenderer.send('add-product', newProduct);

      // Listen for the response
      ipcRenderer.on('product-added', (event, success) => {
        if (success) {
          console.log('Product successfully added');
          this.fetchProducts();  // Refresh the product list after adding
        } else {
          console.log('Failed to add product');
        }
      });
    },
    fetchProducts() {
      ipcRenderer.send('fetch-products');
      ipcRenderer.on('products', (event, products) => {
        this.products = products;
      });
    },
    async syncProducts() {
      try {
        const response = await fetch('https://api.pastaszena.cl/products');
        const data = await response.json();
        if (data && Array.isArray(data)) {
          // Clear existing products and load only specific fields
          this.products = data.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price
          }));

          // Send the new product data through IPC
          if (this.products.length > 0) {
            console.log("Products before sending:", this.products);
            //ipcRenderer.send('sync-products', this.products);
            ipcRenderer.send('sync-products', JSON.parse(JSON.stringify(this.products)));
          } else {
            console.log('No hay productos para sincronizar.');
          }
        } else {
          console.log('No se recibió información de productos');
        }
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    }
  }
};
</script>
