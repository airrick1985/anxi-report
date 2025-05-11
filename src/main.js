// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 假設你有路由

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// 如果你需要特定的 icons (例如 Material Design Icons)
import { aliases, mdi } from 'vuetify/iconsets/mdi' // 或者 fa (Font Awesome) 等
import '@mdi/font/css/materialdesignicons.css' // 確保安裝了 @mdi/font

const vuetify = createVuetify({
  components,
  directives,
  icons: { // 如果使用 icons
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  // 你可以在這裡添加其他 Vuetify 配置，例如主題
})

const app = createApp(App)

app.use(router) // 使用路由
app.use(vuetify) // 使用 Vuetify

app.mount('#app')