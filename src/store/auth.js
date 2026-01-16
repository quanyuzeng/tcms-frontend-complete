import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getUserInfo, refreshToken } from '@/api/auth'
import { setToken, getToken, removeToken } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(getToken())
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => user.value?.roles?.map(r => r.code) || [])
  const userPermissions = computed(() => user.value?.permissions || [])

  const setUser = (userData) => (user.value = userData)
  const setTokenData = (tokenData) => {
    token.value = tokenData
    setToken(tokenData)
  }
  const clearAuth = () => {
    user.value = null
    token.value = null
    removeToken()
  }

  const loginAction = async (credentials) => {
    isLoading.value = true
    try {
      const res = await login(credentials)   // res 就是 { access, user }
      setTokenData(res.access)
      setUser(res.user)
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
    const res = await getUserInfo()   // res 就是用户信息
    setUser(res)
    return res
  }

  const initializeAuth = async () => {
    if (!getToken()) return
    try { await fetchUserInfo() } catch {
      clearAuth()
    }
  }

  const hasRoles = (roles) =>
    !roles?.length || roles.some(r => userRoles.value.includes(r))

  const hasPermissions = (perms) =>
    !perms?.length || perms.every(p => userPermissions.value.includes(p))

  const refreshTokenAction = async () => {
    const res = await refreshToken()
    setTokenData(res.access)
    return res
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    userRoles,
    userPermissions,
    setUser,
    setTokenData,
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