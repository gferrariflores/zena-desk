<template>
  <div class="container my-5 d-flex flex-column align-items-center">
    <h1 class="text-primary text-center my-5">Bienvenido a ZenaDesk</h1>
    <div>
      <router-link to="/products" class="btn btn-success me-2">Ir a Productos</router-link>
      <router-link to="/pos" class="btn btn-success me-2">Ir a POS</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>