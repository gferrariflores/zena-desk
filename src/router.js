import { createRouter, createWebHashHistory } from 'vue-router'; // Ajuste para Vue Router 4
import Home from './views/HomeView.vue';
import Products from './views/ProductsView.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products }
];

const router = createRouter({
  history: createWebHashHistory(), // Esto usa hash en la URL, puedes cambiar a `createWebHistory()` si prefieres URLs sin hash
  routes
});

export default router;
