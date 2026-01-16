// src/api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截
request.interceptors.response.use(
  res => res.data,
  error => {
    const { response } = error
    if (response) {
      if (response.status === 401 || response.status === 403) {
        localStorage.clear()
        router.replace('/login')
      }
      ElMessage.error(response.data?.message || 'Request error')
    } else {
      ElMessage.error('Network error')
    }
    return Promise.reject(error)
  }
)

export default request