// src/api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000
})

/* 请求拦截：自动带 token */
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tcms-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

/* 响应拦截：统一包装 + 错误处理 */
request.interceptors.response.use(
  raw => {
    const body = raw.data

    // 1. 后端已是标准格式 → 直接透传
    if (body && typeof body.code === 'number') return body

    // 2. 后端直接返回对象/数组 → 包一层前端期望格式
    return {
      code: 200,
      message: 'Success',
      data: body
    }
  },
  error => {
    const res = error.response
    if (res) {
      // 401/403 清掉登录态并跳登录
      if (res.status === 401 || res.status === 403) {
        localStorage.clear()
        router.replace('/login')
      }
      ElMessage.error(res.data?.message || res.statusText || 'Request error')
    } else {
      ElMessage.error('Network error')
    }
    return Promise.reject({
      code: res?.status || 500,
      message: res?.data?.message || res?.statusText || 'Network error',
      errors: res?.data?.errors || null
    })
  }
)

export default request