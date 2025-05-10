import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // ✅ 匯入剛才建立的 router

createApp(App).use(router).mount('#app')
