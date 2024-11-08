<template>
  <div class="container my-3">
    <h1>Productos</h1>
    <button @click="addProduct" class="btn btn-primary mb-3">Agregar Producto</button>

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
          <td>{{ product.price }}</td>
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
    }
  }
};
</script>
