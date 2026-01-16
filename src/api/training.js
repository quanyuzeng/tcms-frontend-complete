// src/api/training.js
import request from './request'

// 培训计划 API
export const trainingPlanAPI = {
  getPlans: (params) => request.get('/api/training/plans/', { params }),
  getPlanDetails: (id) => request.get(`/api/training/plans/${id}/`),
  createPlan: (data) => request.post('/api/training/plans/', data),
  updatePlan: (id, data) => request.put(`/api/training/plans/${id}/`, data),
  deletePlan: (id) => request.delete(`/api/training/plans/${id}/`),
  approvePlan: (id) => request.post(`/api/training/plans/${id}/approve/`)
}

// 培训记录 API
export const trainingRecordAPI = {
  getRecords: (params) => request.get('/api/training/records/', { params }),
  getRecordDetails: (id) => request.get(`/api/training/records/${id}/`),
  createRecord: (data) => request.post('/api/training/records/', data),
  updateRecord: (id, data) => request.put(`/api/training/records/${id}/`, data),
  deleteRecord: (id) => request.delete(`/api/training/records/${id}/`),
  evaluateRecord: (id, data) => request.post(`/api/training/records/${id}/evaluate/`, data)
}


export const courseAPI = {
  getCourses: (params) => request.get('/api/training/courses/', { params }),
  getCourseDetails: (id) => request.get(`/api/training/courses/${id}/`),
  createCourse: (data) => request.post('/api/training/courses/', data),
  updateCourse: (id, data) => request.put(`/api/training/courses/${id}/`, data),
  deleteCourse: (id) => request.delete(`/api/training/courses/${id}/`),
  publishCourse: (id) => request.post(`/api/training/courses/${id}/publish/`),

  /* ===== 新增 ===== */
  getCategoryTree: () => request.get('/api/training/categories/tree/'),
  getPositions: (params) => request.get('/api/positions/', { params })
}
export const userAPI = {
  getUsers: (params) => request.get('/api/users/', { params })
}
// ===== 汇总导出，供 Dashboard.vue 使用 =====
export const trainingAPI = {
  ...trainingPlanAPI,
  ...trainingRecordAPI,
  ...courseAPI
}