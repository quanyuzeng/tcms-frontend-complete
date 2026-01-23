import service from './request'

export const login = (data) => service.post('/api/auth/login/', data)
export const logout = () => service.post('/api/auth/logout/')
export const refreshToken = () => service.post('/api/auth/token/refresh/')
export const getUserInfo = () => service.get('/api/users/profile/')
export const changePassword = (data) => service.post('/api/auth/password/change/', data)
export const resetPassword = (data) => service.post('/api/auth/password/reset/', data)
export const confirmResetPassword = (uid, token, data) =>
  service.post(`/api/auth/password/reset/confirm/${uid}/${token}/`, data)