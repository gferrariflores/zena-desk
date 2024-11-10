import axios from 'axios'
//import { toast } from 'vue3-toastify'
import store from '@/store'

export function http(contentType = 'application/json') {
  let token = store.getters['user/getToken']
  //console.log(token)
  const instance = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${token}`
      // Authorization: 'Bearer 1|3HnGiPJbJFutjPHSpNvpMpjquUYo37935HSXgcuz'
    }
  })

  return instance
}

export function handleRetry(error) {
  if (error.response?.status === 403) {
    return axios({
      method: 'POST',
      url: `${process.env.VUE_APP_API_URL}/auth/refresh`,
      data: {
        refresh_token: localStorage.getItem('rt')
      }
    })
      .then(response => {
        localStorage.setItem('rt', response.data.refresh_token)
        sessionStorage.setItem('at', response.data.access_token)

        return Promise.resolve({ hasRenewed: true })
      })
  } else {
    return Promise.reject(error)
  }
}

export function handleUnauthorized(error) {
  if (error.response?.status === 403) {
    localStorage.clear()
    window.location.href = '/'
  } else {
    let message = 'Lo siento, acaba de ocurrir un error'
    switch (error.code) {
      case 'ERR_NETWORK':
        message = 'Lo siento, hay problemas de conectividad. Por favor intenta mas tarde'
        break
      case 'ERR_BAD_RESPONSE':
        switch (error.response.status) {
          case 400:
            message = 'Lo siento, la solicitud enviada es invalida'
            break
          case 401:
            message = 'Lo siento, no posees permisos para acceder'
            break
          case 404:
            message = 'Lo siento, no se han encontrado datos'
            break
          case 500:
            message = 'Lo siento, ha ocurrido un problema en el servidor'
            break
        }
        break
    }
    alert(message)
    /*
    toast.error(message,
      {
        autoClose: 2500,
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'colored',
        icon: true,
        newestOnTop: true,
        pauseOnFocusLoss: false,
        clearOnUrlChange: false,
      }
    )
    */
    console.log(error)
  }
}

export default http
