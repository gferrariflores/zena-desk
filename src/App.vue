<template>
  <div id="app">
    <nav class="navbar navbar-light bg-light px-3">
      <div class="container">
        <a class="navbar-brand" href="#">ZenaDesk</a>
        <div class="d-flex justify-content-start">
          <router-link class="nav-link" to="/">Inicio</router-link>
          <router-link class="nav-link" to="/products">Productos</router-link>
          <router-link class="nav-link" to="/pos">POS</router-link>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>

const { ipcRenderer } = require('electron');

export default {
  name: 'App',
  mounted() {
    ipcRenderer.send('fetch-products'); // Request data from the main process
  },
  created() {
    ipcRenderer.on('products', (event, data) => {
      if (data.error) {
        console.error(data.error);
      } else {
        console.log(data); // Handle and display data in your component
      }
    });
  }
}
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';

.navbar {
  border-bottom: 1px solid #e0e0e0;
}

.nav-link {
  margin-left: 1rem;
}
</style>