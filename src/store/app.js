// src/store/app.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import zh from 'element-plus/es/locale/lang/zh-cn'

export const useAppStore = defineStore('app', () => {
  // 状态
  const sidebarCollapsed = ref(false)
  const theme = ref('light')
  const language = ref(localStorage.getItem('language') || 'zh-CN')
  const elementLocale = ref(zh)   // ← 默认中文
  const isLoading = ref(false)
  const loadingText = ref('')

  // 计算属性
  const currentTheme = computed(() => theme.value)
  const currentLanguage = computed(() => language.value)

  // 方法
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const setLanguage = (newLanguage) => {
    language.value = newLanguage
    localStorage.setItem('language', newLanguage)
  }

  const setElementLocale = (locale) => {   // ← 新增
    elementLocale.value = locale
  }

  const showLoading = (text = '加载中...') => {
    isLoading.value = true
    loadingText.value = text
  }

  const hideLoading = () => {
    isLoading.value = false
    loadingText.value = ''
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
  }

  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem('language') || 'zh-CN'
    setLanguage(savedLanguage)
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    elementLocale,        // ← 导出
    isLoading,
    loadingText,
    currentTheme,
    currentLanguage,
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    setLanguage,
    setElementLocale,     // ← 导出
    showLoading,
    hideLoading,
    initializeTheme,
    initializeLanguage
  }
})