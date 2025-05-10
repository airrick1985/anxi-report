// src/main.js
import { createApp } from 'vue'
import App from './App.vue'     // 引入 App.vue
import router from './router' // 引入你的路由設定

const app = createApp(App)
app.use(router)             // 使用路由
app.mount('#app')           // 掛載到 index.html 中的 #app div