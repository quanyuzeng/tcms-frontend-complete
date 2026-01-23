import Cookies from 'js-cookie'

const TokenKey = 'tcms-token'
const UserKey = 'tcms-user'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  // 确保在根路径下全局可读，7 天过期
  return Cookies.set(TokenKey, token, { expires: 7, path: '/' })
}

export function removeToken() {
  return Cookies.remove(TokenKey, { path: '/' })
}

export function getUser() {
  const userStr = localStorage.getItem(UserKey)
  return userStr ? JSON.parse(userStr) : null
}

export function setUser(user) {
  localStorage.setItem(UserKey, JSON.stringify(user))
}

export function removeUser() {
  localStorage.removeItem(UserKey)
}

export function clearAuth() {
  removeToken()
  removeUser()
}