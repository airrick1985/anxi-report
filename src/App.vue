<template>
  <div id="app-container">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
// 這個 App.vue 主要作為路由容器，
// 通常不需要太多特定的 <script setup> 邏輯。
// 如果將來有全局的狀態、方法或生命週期鉤子需要在 App 層面處理，
// 可以在這裡添加。
// 例如，監聽視窗大小變化、設定全局的 meta 標籤等。
</script>

<style>
/* 全局樣式 (影響整個應用程式) */
/* 這些樣式會應用到所有頁面和組件，除非被更具體的樣式覆蓋 */

/* 重置一些瀏覽器預設樣式 (可選，但推薦) */
html, body, #app, #app-container {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box; /* 讓 padding 和 border 不會增加元素總寬高 */
}

*, *::before, *::after {
  box-sizing: inherit;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  line-height: 1.6;
  background-color: #f4f7f6; /* 一個柔和的背景色 */
  color: #333; /* 預設文字顏色 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-container {
  /* 如果你的應用程式內容不足以填滿整個視窗高度，
     並且你希望背景色能覆蓋整個視窗，
     確保 html, body, #app, #app-container 都有 height: 100% */
  display: flex; /* 可選，如果希望內容垂直居中或有特定佈局 */
  flex-direction: column; /* 可選 */
}

/* 路由切換過渡動畫 (可選) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 你可以在這裡添加更多全局樣式，例如：
   - 連結樣式
   - 標題樣式
   - 按鈕預設樣式
   - 等等
*/

/* 範例：全局連結樣式 */
/*
a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
*/
</style>