// src/utils/auth.js
const TokenKey = 'tcms-token'
const UserKey = 'tcms-user'

// token 读写改用 localStorage
export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  localStorage.removeItem(TokenKey)
}

// user 仍用 localStorage（不变）
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