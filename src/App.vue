<template>
  <div id="app">
    <router-link to="/">Home</router-link>
    <router-link to="/products">Productos</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
</style>
