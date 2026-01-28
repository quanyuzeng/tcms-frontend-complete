// src/api/organization.js
import request from './request'

/**
 * 组织维度 API（原 organizations，现统一用 organization）
 * 如后端无此资源，可保留为空实现或直接删除
 */
export const orgAPI = {
  getOrganizations: (params) => request.get('/api/organization/org-units/', { params }),
  getOrgTree: () => request.get('/api/organization/org-units/tree/'),
  createOrganization: (data) => request.post('/api/organization/org-units/', data),
  updateOrganization: (id, data) => request.put(`/api/organization/org-units/${id}/`, data),
  deleteOrganization: (id) => request.delete(`/api/organization/org-units/${id}/`)
}

/**
 * 部门管理 API（修复后，不再 404）
 */
export const departmentAPI = {
  // 分页列表
  getDepartments: (params) => request.get('/api/organization/departments/', { params }),

  // 部门树（下拉用）
  getDepartmentTree: () => request.get('/api/organization/departments/tree/'),

  // 新增
  createDepartment: (data) => request.post('/api/organization/departments/', data),

  // 更新
  updateDepartment: (id, data) => request.put(`/api/organization/departments/${id}/`, data),

  // 删除
  deleteDepartment: (id) => request.delete(`/api/organization/departments/${id}/`)
}

/**
 * 岗位管理 API（新增，同样使用 organization 前缀）
 */
export const positionAPI = {
  // 分页列表
  getPositions: (params) => request.get('/api/organization/positions/', { params }),

  // 岗位树（若后端提供）
  getPositionTree: () => request.get('/api/organization/positions/tree/'),

  // 新增
  createPosition: (data) => request.post('/api/organization/positions/', data),

  // 更新
  updatePosition: (id, data) => request.put(`/api/organization/positions/${id}/`, data),

  // 删除
  deletePosition: (id) => request.delete(`/api/organization/positions/${id}/`)
}