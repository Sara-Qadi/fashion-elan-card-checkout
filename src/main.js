import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import vuetify from '@/plugins/vuetify'
import '@/styles/main.css'

const app = createApp(App)

// Pinia first: the router guards read the cart and checkout stores.
app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
