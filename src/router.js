import { createRouter, createWebHashHistory } from 'vue-router' // Ajuste para Vue Router 4
import Home from './views/HomeView.vue'
import Products from './views/ProductsView.vue'
import Pos from './views/PosIndex.vue'
import PosCreate from './views/PosCreate.vue'
import PosView from './views/PosView.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/pos', component: Pos },
  { path: '/pos-create', component: PosCreate },
  { path: '/pos-view/:id', component: PosView }
]

const router = createRouter({
  history: createWebHashHistory(), // Esto usa hash en la URL, puedes cambiar a `createWebHistory()` si prefieres URLs sin hash
  routes
})

export default router
