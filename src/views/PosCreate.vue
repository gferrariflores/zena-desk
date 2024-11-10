<!-- src/views/PosView.vue -->
<template>
    <div class="container my-3">
        <h1>Crear Transacción</h1>
        <p>Selecciona productos, establece cantidades y agrega al carrito.</p>
        <!-- Aquí va el formulario o los elementos del POS -->

        <h5>Productos</h5>

        <div>
            <div v-for="(tp) in transaction_products" :key="tp.id" class="row">
                <div class="col-md-4 mb-2">
                    <select class="form-select" v-model="tp.product_id" @change="productChanged(tp.index)">
                        <option :value="null" disabled hidden>Selecciona un Producto</option>
                        <option v-for="(product) in products" :key="product.id" :value="product.id">{{ product.name }}
                        </option>
                    </select>
                </div>
                <div class="col-md-2 mb-2">
                    <input type="number" class="form-control" :placeholder="`Cantidad ${tp.index}`"
                        v-model="tp.product_quantity" @change="qtyOrPriceChanged(tp.index)">
                </div>
                <div class="col-md-2 mb-2">
                    <input type="text" class="form-control" :placeholder="`Precio Unitario ${tp.index}`"
                        v-model="tp.product_unit_price" readonly disabled>
                </div>
                <div class="col-md-2 mb-2">
                    <input type="text" class="form-control" :placeholder="`Subtotal ${tp.index}`"
                        v-model="tp.product_extended_price">
                </div>
                <div class="col-md-2 mb-2">
                    <div class="d-grid gap-2">
                        <button class="btn btn-danger text-center" @click.prevent="removeProduct(tp.index)">
                            Borrar
                        </button>
                    </div>
                </div>
            </div>
            <div class="my-2 d-grid gap-2 d-md-flex ">
                <button type="submit" class="btn btn-secondary col-md-3" @click.prevent="addProduct">
                    Agregar Producto
                </button>
            </div>
            <hr>
            <h2>Total: ${{ new Intl.NumberFormat("de-DE").format(transactionTotal) }}</h2>
            <hr>

            <div class="row">
                <div class="col-md-4">
                    <label class="form-label">Método de Pago</label>
                    <select class="form-select" v-model="paymentMethod">
                        <option :value="0" disabled hidden>Selecciona método de pago</option>
                        <option v-for="(pm) in paymentMethods" :key="pm.key" :value="pm.key">{{ pm.name }}</option>
                    </select>
                </div>
            </div>

            <hr>

            <div class="my-3 d-grid gap-2 d-md-flex ">
                <button type="submit" class="btn btn-primary col-md-3" @click.prevent="submit">
                    Enviar
                </button>
            </div>

        </div>


    </div>
</template>

<script>

import { ipcRenderer } from 'electron'
import { remove, find } from 'lodash'
//import { http } from '@/utils/http'

export default {
    name: 'PosView',
    data() {
        return {
            transactionDate: new Date().toLocaleDateString('en-GB'),
            transaction_products: [{
                'index': 1,
                'product_id': null,
                'product_quantity': null,
                'product_unit_price': null,
                'product_discount': 0,
                'product_extended_price': 0
            }],
            transactionTotal: 0,
            paymentMethods: [],
            paymentMethod: 0,
            products: []
        }
    },
    mounted() {
        this.fetchProducts()
        this.fetchPaymentMethods()
        //this.uniqid = this.createUniqid('d-t')
        this.uniqid = this.createUniqid('t')
    },
    methods: {
        submit() {
            const dateString = this.transactionDate.substr(3, 2) + "/" + this.transactionDate.substr(0, 2) + "/" + this.transactionDate.substr(6, 4)
            const transaction = {
                transaction_date: new Date(dateString).toISOString().substring(0, 10),
                // store_id: this.store_id,
                store_id: 1,
                uniqid: this.uniqid,
                transaction_total: this.transactionTotal,
                payment_method: this.paymentMethod,
                //inserted_by: this.currentUser.id,
                inserted_by: 0,
                products: this.transaction_products
            }

            // Convert to JSON and back to ensure it's plain serializable data
            const transactionData = JSON.parse(JSON.stringify(transaction))

            // Send the new transaction data through IPC
            ipcRenderer.send('create-transaction', transactionData)
            ipcRenderer.on('transaction-created', () => {
                // console.log('Transaction Created Replied')
                this.$router.push("/pos");
            })
        },
        createUniqid(prefix = "", random = false) {
            const sec = Date.now() * 1000 + Math.random() * 1000
            const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0")
            return `${prefix}${id}${random ? `.${Math.trunc(Math.random() * 100000000)}` : ""}`
        },
        fetchProducts() {
            ipcRenderer.send('fetch-products')
            ipcRenderer.on('products', (event, products) => {
                this.products = products
            })
        },
        addProduct() {
            this.transaction_products.push({
                'index': this.transaction_products.length + 1,
                'product_id': null,
                'product_quantity': null,
                'product_unit_price': null,
                'product_discount': 0, //no vamos a agregar dcto por ahora
                'product_extended_price': 0
            })
        },
        productChanged(passIndex) {
            // const qty = this.transaction_products[passIndex - 1]['product_quantity']
            // const disc = this.transaction_products[passIndex - 1]['product_discount'] / 100
            const prodId = this.transaction_products[passIndex - 1]['product_id']
            if (prodId) {
                const product = find(this.products, function (prod) { return prod.id === prodId })
                this.transaction_products[passIndex - 1]['product_unit_price'] = product.price
            }
            this.calcTransactionTotal()
        },
        qtyOrPriceChanged(passIndex) {
            const qty = this.transaction_products[passIndex - 1]['product_quantity']
            // const disc = this.transaction_products[passIndex - 1]['product_discount'] / 100
            const disc = 0
            const unitPrice = this.transaction_products[passIndex - 1]['product_unit_price']
            const prodId = this.transaction_products[passIndex - 1]['product_id']
            if (prodId) {
                this.transaction_products[passIndex - 1]['product_extended_price'] = qty * unitPrice * (1 - disc)
            }
            this.calcTransactionTotal()
        },
        removeProduct(passIndex) {
            remove(this.transaction_products, function (prod) { return prod.index === passIndex })
            this.transaction_products.forEach(function (element, index) {
                element.index = index + 1
            })
            this.calcTransactionTotal()
        },
        calcTransactionTotal() {
            let sum = 0
            this.transaction_products.forEach(function (element) {
                sum = sum + element['product_extended_price'] * 1
            })
            this.transactionTotal = Math.round(sum / 10) * 10
        },
        fetchPaymentMethods() {
            /*
            http().get('/payment_methods')
                .then(response => {
                    //console.log(response.data)
                    this.paymentMethods = response.data
                })
            */
            this.paymentMethods = [
                { key: 1, name: 'Efectivo' },
                { key: 2, name: 'Tarjeta Débito' },
                { key: 3, name: 'Tarjeta Crédito' },
                { key: 4, name: 'Transferencia' },
                { key: 5, name: 'Cheque' },
                { key: 6, name: 'Rappi' },
                { key: 7, name: 'Otro' },
            ]
        },
    }
}
</script>