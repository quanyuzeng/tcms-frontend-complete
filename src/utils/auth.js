import Cookies from 'js-cookie'

const TokenKey = 'tcms-token'
const UserKey = 'tcms-user'

// 获取Token
export function getToken() {
  return Cookies.get(TokenKey)
}

// 设置Token
export function setToken(token) {
  return Cookies.set(TokenKey, token, { expires: 7 }) // 7天有效期
}

// 删除Token
export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 获取用户信息
export function getUser() {
  const userStr = localStorage.getItem(UserKey)
  return userStr ? JSON.parse(userStr) : null
}

// 设置用户信息
export function setUser(user) {
  return localStorage.setItem(UserKey, JSON.stringify(user))
}

// 删除用户信息
export function removeUser() {
  return localStorage.removeItem(UserKey)
}

// 清除所有认证信息
export function clearAuth() {
  removeToken()
  removeUser()
}
