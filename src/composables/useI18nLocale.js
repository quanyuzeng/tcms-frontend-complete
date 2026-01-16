// src/composables/useI18nLocale.js
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const elementLocaleMap = { 'zh-CN': zhCn, 'en-US': en }

export function useI18nLocale() {
  const { locale, t } = useI18n()
  const appStore = useAppStore()

  const changeLanguage = (lang) => {
    locale.value = lang
    appStore.setLanguage(lang)
    // ★★★ 同步 Element Plus 组件内部文案 ★★★
    appStore.setElementLocale(elementLocaleMap[lang])
    ElMessage.success(t('message.languageChanged'))
  }

  return { changeLanguage }
}