import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/anxi-report/', // ✅ 這裡填入你的 GitHub repo 名稱
  plugins: [vue()]
})
