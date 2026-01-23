// src/store/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getUserInfo, refreshToken } from '@/api/auth'
import { setToken, getToken, removeToken, setUser, removeUser } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(getToken())
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => user.value?.roles?.map(r => r.code) || [])
  const userPermissions = computed(() => user.value?.permissions || [])

  const setUserData = (userData) => {
    user.value = userData
    setUser(userData)
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    removeToken()
    removeUser()
  }

  /* 登录：只有一层 data */
  const loginAction = async (credentials) => {
    isLoading.value = true
    try {
      const res = await login(credentials)   // res.data = {access, refresh, user}
      const accessToken = res.data.access
      token.value = accessToken
      setToken(accessToken)
      setUserData(res.data.user)
      return res
    } catch (e) {
      clearAuth()
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const logoutAction = async () => {
    try { await logout() } catch {}
    clearAuth()
  }

  const fetchUserInfo = async () => {
    const res = await getUserInfo()
    setUserData(res)
    return res
  }

  const initializeAuth = async () => {
    const tk = getToken()
    if (!tk) return
    try {
      await fetchUserInfo()
      token.value = tk
    } catch {
      clearAuth()
    }
  }

  const hasRoles = (roles) =>
    !roles?.length || roles.some(r => userRoles.value.includes(r))

  const hasPermissions = (perms) =>
    !perms?.length || perms.every(p => userPermissions.value.includes(p))

  /* 刷新 token：同样只有一层 data */
  const refreshTokenAction = async () => {
    const res = await refreshToken()
    const accessToken = res.data.access
    token.value = accessToken
    setToken(accessToken)
    return res
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    userRoles,
    userPermissions,
    clearAuth,
    loginAction,
    logoutAction,
    fetchUserInfo,
    initializeAuth,
    hasRoles,
    hasPermissions,
    refreshTokenAction
  }
})