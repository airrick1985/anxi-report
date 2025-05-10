// src/router/index.js (或你實際的路由設定檔路徑)
import { createRouter, createWebHashHistory } from 'vue-router'
import ReportPage from '@/pages/ReportPage.vue' // 確保這個路徑下的檔案確實存在

const routes = [
  { path: '/', redirect: '/report' },
  { path: '/report', component: ReportPage }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL), // 建議傳入 BASE_URL
  routes
})

export default router