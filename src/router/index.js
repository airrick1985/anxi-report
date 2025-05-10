import { createRouter, createWebHashHistory } from 'vue-router'
import ReportPage from '@/pages/ReportPage.vue'

const routes = [
  { path: '/', redirect: '/report' },
  { path: '/report', component: ReportPage }
]

const router = createRouter({
  history: createWebHashHistory(), // ✅ 使用 Hash 模式，支援 GitHub Pages
  routes
})

export default router
