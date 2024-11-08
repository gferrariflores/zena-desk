import { createRouter, createWebHashHistory } from 'vue-router'; // Ajuste para Vue Router 4
import Home from './views/HomeView.vue';
import Products from './views/ProductsView.vue';
import Pos from './views/PosView.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/pos', component: Pos }
];

const router = createRouter({
  history: createWebHashHistory(), // Esto usa hash en la URL, puedes cambiar a `createWebHistory()` si prefieres URLs sin hash
  routes
});

export default router;
