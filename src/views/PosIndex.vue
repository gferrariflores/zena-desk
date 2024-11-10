<!-- src/views/PosView.vue -->
<template>
  <div class="container my-3">
    <h1>POS</h1>
    <p>Selecciona productos, establece cantidades y agrega al carrito.</p>
    <!-- Aquí va el formulario o los elementos del POS -->
    <router-link to="/pos-create" class="btn btn-success me-2">Crear Transacción</router-link>

    <div class="table-responsive">

      <table class="table table-light table-sm">
        <thead>
          <tr>
            <th class="text-nowrap">Acciones</th>
            <th class="text-nowrap">ID</th>
            <th class="text-nowrap">Fecha</th>
            <th class="text-nowrap">Total</th>
            <th class="text-nowrap">Método de Pago</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item) in transactions" :key="item.id">
            <td class="text-nowrap">
              <router-link :to="{ path: `/pos-view/${item.id}` }" class="me-2">Ver</router-link>
            </td>
            <th>{{ item.id }}</th>
            <td class="text-nowrap">{{ item.created_at }}</td>
            <td class="text-nowrap">${{ new Intl.NumberFormat("de-DE").format(item.transaction_total) }}</td>
            <td class="text-nowrap">{{ item.pm_name }}</td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { find } from 'lodash'

export default {
  name: 'PosIndex',
  data() {
    return {
      transactions: [],
    }
  },
  mounted() {
    this.fetchTransactions()
  },
  methods: {
    fetchTransactions() {
      ipcRenderer.send('fetch-transactions')
      ipcRenderer.on('transactions', (event, transactions) => {
        transactions.forEach(t => {
          const paymentMethods = [
            { key: 1, name: 'Efectivo' },
            { key: 2, name: 'Tarjeta Débito' },
            { key: 3, name: 'Tarjeta Crédito' },
            { key: 4, name: 'Transferencia' },
            { key: 5, name: 'Cheque' },
            { key: 6, name: 'Rappi' },
            { key: 7, name: 'Otro' },
          ]
          //t.pm_name = 'test'
          const pmKey = t.payment_method
          // const product = find(this.products, function (prod) { return prod.id === prodId })
          t.pm_name = find(paymentMethods, function (pm) { return pm.key === pmKey }).name
        })
        this.transactions = transactions
        console.log(transactions)
      })
    },
  }
}
</script>