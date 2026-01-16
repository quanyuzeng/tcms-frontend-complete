// src/api/organization.js
import request from './request'

export const orgAPI = {
  getOrganizations: (params) => request.get('/api/organizations/', { params }),
  getOrgTree: () => request.get('/api/organizations/tree/'),
  createOrganization: (data) => request.post('/api/organizations/', data),
  updateOrganization: (id, data) => request.put(`/api/organizations/${id}/`, data),
  deleteOrganization: (id) => request.delete(`/api/organizations/${id}/`)
}
export const departmentAPI = {
  // 分页列表
  getDepartments: (params) => request.get('/api/departments/', { params }),

  // 部门树（下拉用）
  getDepartmentTree: () => request.get('/api/departments/tree/'),

  // 新增
  createDepartment: (data) => request.post('/api/departments/', data),

  // 更新
  updateDepartment: (id, data) => request.put(`/api/departments/${id}/`, data),

  // 删除
  deleteDepartment: (id) => request.delete(`/api/departments/${id}/`)
}