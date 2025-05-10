import { createRouter, createWebHashHistory } from 'vue-router'
import ReportPage from '../pages/ReportPage.vue'

const routes = [
  { path: '/', redirect: '/report' },
  { path: '/report', name: 'ReportPage', component: ReportPage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
