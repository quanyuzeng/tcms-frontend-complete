// src/api/position.js
import request from './request'

export const positionAPI = {
  list: (params) => request.get('/api/organization/positions/', { params }),
  get: (id) => request.get(`/api/organization/positions/${id}/`),
  create: (data) => request.post('/api/organization/positions/', data),
  update: (id, data) => request.put(`/api/organization/positions/${id}/`, data),
  delete: (id) => request.delete(`/api/organization/positions/${id}/`),
  getPositions: (params) => request.get('/api/organization/positions/', { params })
}