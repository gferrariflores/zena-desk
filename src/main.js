// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Importa Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Importa Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

createApp(App)
  .use(router)
  .mount('#app');
