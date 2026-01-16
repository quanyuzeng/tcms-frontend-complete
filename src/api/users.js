// src/api/users.js
import request from './request'

export const userAPI = {
  getUsers: (params) => request.get('/api/users/', { params }),
  getUser: (id) => request.get(`/api/users/${id}/`),
  createUser: (data) => request.post('/api/users/', data),
  updateUser: (id, data) => request.put(`/api/users/${id}/`, data),
  deleteUser: (id) => request.delete(`/api/users/${id}/`)
}