import service from './request'

export const login = (data) => service.post('/auth/login/', data)
export const logout = () => service.post('/auth/logout/')
export const refreshToken = () => service.post('/auth/token/refresh/')
export const getUserInfo = () => service.get('/users/profile/')
export const changePassword = (data) => service.post('/auth/password/change/', data)
export const resetPassword = (data) => service.post('/auth/password/reset/', data)
export const confirmResetPassword = (uid, token, data) =>
  service.post(`/auth/password/reset/confirm/${uid}/${token}/`, data)