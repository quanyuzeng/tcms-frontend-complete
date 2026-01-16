// src/api/position.js
import request from './request'

export const positionAPI = {
  list: (params) => request.get('/api/positions/', { params }),
  get: (id) => request.get(`/api/positions/${id}/`),
  create: (data) => request.post('/api/positions/', data),
  update: (id, data) => request.put(`/api/positions/${id}/`, data),
  delete: (id) => request.delete(`/api/positions/${id}/`),
  getPositions: (params) => request.get('/api/positions/', { params })
}