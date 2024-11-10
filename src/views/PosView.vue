<template>
    <div class="container my-3">
        <h1>POS View</h1>
        <p><strong>Transaction ID:</strong> {{ transactionId }}</p>

        <!-- Display Transaction Details -->
        <div v-if="transaction">
            <p><strong>Date:</strong> {{ transaction.transaction_date }}</p>
            <p><strong>Total:</strong> ${{ transaction.transaction_total }}</p>
            <p><strong>Payment Method:</strong> {{ transaction.pm_name }}</p>
            <p><strong>Created At:</strong> {{ transaction.created_at }}</p>
        </div>

        <!-- Display Products Table -->
        <table v-if="transaction.products.length" class="table table-striped mt-4">
            <thead>
                <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Extended Price</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in transaction.products" :key="product.id">
                    <td>{{ product.prod_id }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>{{ product.unit_price }}</td>
                    <td>{{ product.discount }}</td>
                    <td>${{ product.extended_price }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>

import { ipcRenderer } from 'electron'
import { find } from 'lodash'

export default {
    name: 'PosView',
    data() {
        return {
            transactionId: this.$route.params.id, // Access the route parameter here
            transaction: {
                products: []
            },
            products: []
        }
    },
    mounted() {
        this.fetchProducts()
        this.fetchTransaction()
    },
    methods: {
        fetchProducts() {
            ipcRenderer.send('fetch-products')
            ipcRenderer.on('products', (event, products) => {
                this.products = products
                console.log(products)
            })
        },
        fetchTransaction() {
            ipcRenderer.send('fetch-transaction', this.transactionId)
            ipcRenderer.on('transaction', (event, transaction) => {

                const paymentMethods = [
                    { key: 1, name: 'Efectivo' },
                    { key: 2, name: 'Tarjeta Débito' },
                    { key: 3, name: 'Tarjeta Crédito' },
                    { key: 4, name: 'Transferencia' },
                    { key: 5, name: 'Cheque' },
                    { key: 6, name: 'Rappi' },
                    { key: 7, name: 'Otro' },
                ]
                transaction.pm_name = find(paymentMethods, function (pm) { return pm.key === transaction.payment_method }).name

                transaction.products.forEach(tp => {
                    const product = find(this.products, function (prod) { return prod.id === tp.prod_id })
                    tp.name = product ? product.name : null // Set name if product is found, else set to null
                })

                this.transaction = transaction
                console.log(transaction)
            })
        },
    }
}
</script>
