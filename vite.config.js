// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'; // 引入 Node.js 的 URL 模組

export default defineConfig({
  base: '/anxi-report/', // 你的 GitHub repo 名稱
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // 明確定義 @ 指向 src
    },
  },
})