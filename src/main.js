// src/main.js
/* ===== dayjs 必须在最前引入 ===== */
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('en')          // 默认英文

/* ===== 其他依赖 ===== */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import en from 'element-plus/es/locale/lang/en' // ① 英文包
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/auth'

// 国际化语言包
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

/* ===== 创建 i18n 实例 ===== */
export const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS   
  }
})
/* ===== 创建应用 ===== */
const app = createApp(App)
const pinia = createPinia()
app.use(pinia).use(router).use(i18n)

/* ===== ③ 直接给 Element Plus 英文 locale ===== */
app.use(ElementPlus, { locale: en })

/* ===== 注册所有 Element Plus 图标 ===== */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/* ===== 初始化认证状态 ===== */
const authStore = useAuthStore()
authStore.initializeAuth()

/* ===== 挂载 ===== */
app.mount('#app')

/* ===== 拦截 dayjs 原型方法，修复链式调用 ===== */
const OriginalLocale = dayjs.prototype.locale
dayjs.prototype.locale = function (...args) {
  OriginalLocale.apply(this, args)
  return this
}